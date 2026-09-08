import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { GoogleGenAI, Modality } from "@google/genai";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface GeneratedMedia {
  buffer: Buffer;
  mimeType: string;
}

const VIDEO_POLL_INTERVAL_MS = 10_000;
const VIDEO_POLL_MAX_ATTEMPTS = 18; // safety cap; the caller enforces the real 2-minute budget

@Injectable()
export class GeminiService {
  private ai?: GoogleGenAI;

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        "AI generation is not configured: GEMINI_API_KEY is missing",
      );
    }

    this.ai ??= new GoogleGenAI({ apiKey });
    return this.ai;
  }

  async generateImage(prompt: string, model: string): Promise<GeneratedMedia> {
    const response = await this.getClient().models.generateContent({
      model,
      contents: prompt,
      config: { responseModalities: [Modality.IMAGE] },
    });

    const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part?.inlineData?.data) {
      throw new Error("Gemini returned no image data");
    }

    return {
      buffer: Buffer.from(part.inlineData.data, "base64"),
      mimeType: part.inlineData.mimeType ?? "image/png",
    };
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.getClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned no text");
    }

    return text.trim();
  }

  async generateVideo(
    prompt: string,
    model: string,
    durationSeconds: number,
    aspectRatio: string,
  ): Promise<GeneratedMedia> {
    const ai = this.getClient();
    let operation = await ai.models.generateVideos({
      model,
      source: { prompt },
      config: { numberOfVideos: 1, durationSeconds, aspectRatio },
    });

    for (let attempt = 0; !operation.done && attempt < VIDEO_POLL_MAX_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, VIDEO_POLL_INTERVAL_MS));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      throw new Error("Gemini video generation did not complete in time");
    }
    if (operation.error) {
      throw new Error(`Gemini video generation failed: ${JSON.stringify(operation.error)}`);
    }

    const generated = operation.response?.generatedVideos?.[0]?.video;
    if (!generated) {
      throw new Error("Gemini returned no video data");
    }

    if (generated.videoBytes) {
      return {
        buffer: Buffer.from(generated.videoBytes, "base64"),
        mimeType: generated.mimeType ?? "video/mp4",
      };
    }

    if (generated.uri) {
      const dir = await mkdtemp(join(tmpdir(), "azaisai-video-"));
      const downloadPath = join(dir, "video.mp4");
      try {
        await ai.files.download({ file: generated, downloadPath });
        const buffer = await readFile(downloadPath);
        return { buffer, mimeType: generated.mimeType ?? "video/mp4" };
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }

    throw new Error("Gemini returned a video with neither bytes nor a URI");
  }
}
