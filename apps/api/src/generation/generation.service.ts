import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { CreditsService } from "../credits/credits.service";
import type { GeneratedMedia } from "../gemini/gemini.service";
import { GeminiService } from "../gemini/gemini.service";
import type { PlanTier } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import type { EnhancePromptDto } from "./dto/enhance-prompt.dto";
import type { GenerateDto } from "./dto/generate.dto";
import {
  ALLOWED_VIDEO_DURATIONS,
  computeCreditsCost,
  getModelCatalog,
  IMAGE_MODELS,
  validateSettings,
  VIDEO_MODELS,
} from "./model-catalog";

const FREE_ENHANCEMENTS_PER_DAY = 3;
const ENHANCEMENT_CREDIT_COST = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

const ENHANCE_INSTRUCTIONS: Record<"enhance" | "variation", (noun: string) => string> = {
  enhance: (noun) =>
    `Rewrite the following prompt into a more detailed, generation-optimized prompt for an AI ${noun} generator. ` +
    `Keep the same core subject and intent, but add vivid, concrete visual detail (composition, lighting, mood, style cues). ` +
    `Reply with only the rewritten prompt, no preamble or quotes.\n\nPrompt: `,
  variation: (noun) =>
    `Rewrite the following prompt as an alternate phrasing for an AI ${noun} generator, preserving the same core subject ` +
    `and intent but varying the wording and descriptive details. Reply with only the rewritten prompt, no preamble or quotes.\n\nPrompt: `,
};

const GENERATION_TIMEOUT_MS = 2 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Generation timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/** Google returns this for a Gemini API key whose project has no billing account — image/video
 * models are billing-gated, so this is a hard block, not a transient rate limit. Worth telling
 * the user the truth instead of "try again", since retrying can't possibly help. */
function isQuotaExhaustedError(technicalMessage: string): boolean {
  return /RESOURCE_EXHAUSTED|quota exceeded/i.test(technicalMessage);
}

function safeUserMessage(type: "IMAGE" | "VIDEO", technicalMessage: string): string {
  const noun = type === "VIDEO" ? "video" : "image";
  if (isQuotaExhaustedError(technicalMessage)) {
    return `${noun === "video" ? "Video" : "Image"} generation is temporarily unavailable — the AI provider's usage limit has been reached. Your credits have been refunded; please check back later.`;
  }
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

  async create(user: AuthenticatedUser, dto: GenerateDto) {
    const userId = user.id;
    let creditsCost: number;
    try {
      validateSettings(dto.type, dto.model, dto.settings);
      creditsCost = computeCreditsCost(dto.type, dto.model, dto.settings?.durationSeconds);
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : "Invalid model");
    }

    const catalogConfig = dto.type === "IMAGE" ? IMAGE_MODELS[dto.model] : VIDEO_MODELS[dto.model];
    if (catalogConfig.tier === "PAID" && user.plan === "FREE") {
      throw new ForbiddenException("Upgrade your plan to use this model");
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
            userMessage: safeUserMessage(dto.type, technicalMessage),
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

  getModels(userPlan: PlanTier) {
    return getModelCatalog(userPlan);
  }

  async enhancePrompt(user: AuthenticatedUser, dto: EnhancePromptDto) {
    const dbUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { dailyEnhanceCount: true, dailyEnhanceResetAt: true },
    });

    const resetDue = Date.now() - dbUser.dailyEnhanceResetAt.getTime() > DAY_MS;
    const currentCount = resetDue ? 0 : dbUser.dailyEnhanceCount;

    const usingFreeAllowance = currentCount < FREE_ENHANCEMENTS_PER_DAY;

    await this.prisma.user.update({
      where: { id: user.id },
      data: resetDue
        ? { dailyEnhanceCount: 1, dailyEnhanceResetAt: new Date() }
        : { dailyEnhanceCount: { increment: 1 } },
    });

    if (!usingFreeAllowance) {
      await this.credits.debit(user.id, ENHANCEMENT_CREDIT_COST, "PROMPT_ENHANCEMENT");
    }

    const noun = dto.type === "VIDEO" ? "video" : "image";
    const instruction = ENHANCE_INSTRUCTIONS[dto.mode](noun) + dto.prompt;

    try {
      const rewritten = await this.gemini.generateText(instruction);
      return {
        prompt: rewritten,
        remainingFree: Math.max(0, FREE_ENHANCEMENTS_PER_DAY - currentCount - 1),
      };
    } catch (err) {
      this.logger.error(`Prompt ${dto.mode} failed: ${err instanceof Error ? err.message : err}`);

      if (!usingFreeAllowance) {
        await this.credits.credit(user.id, ENHANCEMENT_CREDIT_COST, "PROMPT_ENHANCEMENT");
      }

      throw new BadRequestException(
        `We couldn't ${dto.mode === "enhance" ? "enhance" : "generate a variation of"} that prompt right now — please try again.`,
      );
    }
  }
}
