import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreditsService } from "../credits/credits.service";
import type { GeneratedMedia } from "../gemini/gemini.service";
import { GeminiService } from "../gemini/gemini.service";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import type { GenerateDto } from "./dto/generate.dto";
import {
  ALLOWED_VIDEO_DURATIONS,
  computeCreditsCost,
  IMAGE_MODELS,
  VIDEO_MODELS,
} from "./model-catalog";

const GENERATION_TIMEOUT_MS = 2 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Generation timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function safeUserMessage(type: "IMAGE" | "VIDEO"): string {
  const noun = type === "VIDEO" ? "video" : "image";
  return `We couldn't generate your ${noun} right now — this can happen with certain prompts or high demand. Your credits have been refunded, feel free to try again.`;
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("mp4")) return "mp4";
  return "bin";
}

const SAFE_GENERATION_FIELDS = {
  id: true,
  type: true,
  model: true,
  prompt: true,
  settings: true,
  status: true,
  outputUrl: true,
  userMessage: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credits: CreditsService,
    private readonly gemini: GeminiService,
    private readonly storage: StorageService,
  ) {}

  async create(userId: string, dto: GenerateDto) {
    let creditsCost: number;
    try {
      creditsCost = computeCreditsCost(dto.type, dto.model, dto.settings?.durationSeconds);
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : "Invalid model");
    }

    // Debit up front; a failed/timed-out generation refunds it later.
    await this.credits.debit(userId, creditsCost, "GENERATION_DEBIT");

    const generation = await this.prisma.generation.create({
      data: {
        userId,
        type: dto.type,
        model: dto.model,
        prompt: dto.prompt,
        settings: dto.settings ? { ...dto.settings } : {},
        status: "PENDING",
        creditsCost,
      },
    });

    // Fire-and-forget: the caller gets { id } immediately and polls
    // GET /generation/:id for status.
    this.processGeneration(generation.id, userId, dto, creditsCost).catch((err) => {
      this.logger.error(`Unhandled error processing generation ${generation.id}: ${err}`);
    });

    return { id: generation.id };
  }

  private async callGemini(dto: GenerateDto): Promise<GeneratedMedia> {
    if (dto.type === "IMAGE") {
      const config = IMAGE_MODELS[dto.model];
      return this.gemini.generateImage(dto.prompt, config.geminiModel);
    }

    const config = VIDEO_MODELS[dto.model];
    const durationSeconds = dto.settings?.durationSeconds ?? ALLOWED_VIDEO_DURATIONS[0];
    const aspectRatio = dto.settings?.aspectRatio ?? "16:9";
    return this.gemini.generateVideo(dto.prompt, config.geminiModel, durationSeconds, aspectRatio);
  }

  private async processGeneration(
    generationId: string,
    userId: string,
    dto: GenerateDto,
    creditsCost: number,
  ): Promise<void> {
    try {
      const media = await withTimeout(this.callGemini(dto), GENERATION_TIMEOUT_MS);
      const key = `generations/${userId}/${generationId}.${extensionFor(media.mimeType)}`;
      const outputUrl = await this.storage.uploadBuffer(media.buffer, key, media.mimeType);

      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: "COMPLETE", outputUrl },
      });
    } catch (err) {
      const technicalMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Generation ${generationId} failed: ${technicalMessage}`);

      // Mark FAILED and refund atomically — the client never sees
      // `technicalMessage`, only the calm userMessage below.
      await this.prisma.$transaction([
        this.prisma.generation.update({
          where: { id: generationId },
          data: {
            status: "FAILED",
            errorMessage: technicalMessage,
            userMessage: safeUserMessage(dto.type),
          },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { creditBalance: { increment: creditsCost } },
        }),
        this.prisma.creditTransaction.create({
          data: { userId, amount: creditsCost, reason: "GENERATION_REFUND", generationId },
        }),
      ]);
    }
  }

  async findOne(userId: string, id: string) {
    const generation = await this.prisma.generation.findFirst({
      where: { id, userId },
      select: SAFE_GENERATION_FIELDS,
    });

    if (!generation) {
      throw new NotFoundException("Generation not found");
    }

    return generation;
  }

  async history(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: SAFE_GENERATION_FIELDS,
      }),
      this.prisma.generation.count({ where: { userId } }),
    ]);

    return { items, total, page, limit };
  }
}
