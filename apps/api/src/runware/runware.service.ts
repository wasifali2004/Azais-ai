import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import type {
  ImageInferenceResult,
  RunwareClient,
  VideoInferenceResult,
} from "@runware/sdk";
import type { GeneratedMedia } from "../generation/generated-media.interface";

type RunwareSdk = typeof import("@runware/sdk");

// The API app emits CommonJS, while @runware/sdk is ESM-only. Keeping this as
// a native import prevents TypeScript from rewriting it to require().
const loadRunwareSdk = new Function(
  "return import('@runware/sdk')",
) as () => Promise<RunwareSdk>;

const DEFAULT_IMAGE_MODEL = "runware:101@1";
const DEFAULT_VIDEO_MODEL = "pixverse:1@2";
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

const IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "1:1": { width: 1024, height: 1024 },
  "4:3": { width: 1024, height: 768 },
  "3:4": { width: 768, height: 1024 },
};

const VIDEO_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 720, height: 720 },
  "4:3": { width: 960, height: 720 },
  "3:4": { width: 720, height: 960 },
};

@Injectable()
export class RunwareService {
  private clientPromise?: Promise<RunwareClient>;

  private getClient(): Promise<RunwareClient> {
    const apiKey = process.env.RUNWARE_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        "Runware fallback is not configured: RUNWARE_API_KEY is missing",
      );
    }

    this.clientPromise ??= loadRunwareSdk().then(({ createClient }) =>
      createClient({
        apiKey,
        transport: "rest",
        timeout: 2 * 60 * 1000,
        pollTimeout: 6 * 60 * 1000,
      }),
    );
    return this.clientPromise;
  }

  async generateImage(prompt: string, aspectRatio: string): Promise<GeneratedMedia> {
    const client = await this.getClient();
    const dimensions = IMAGE_DIMENSIONS[aspectRatio] ?? IMAGE_DIMENSIONS["1:1"];
    const results = (await client.run({
      taskType: "imageInference",
      model: process.env.RUNWARE_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL,
      positivePrompt: prompt,
      ...dimensions,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "WEBP",
      deliveryMethod: "sync",
    })) as ImageInferenceResult[];

    const imageURL = results[0]?.imageURL;
    if (!imageURL) throw new Error("Runware returned no image URL");
    return this.downloadMedia(imageURL, "image/webp", MAX_IMAGE_BYTES);
  }

  async generateVideo(
    prompt: string,
    durationSeconds: number,
    aspectRatio: string,
  ): Promise<GeneratedMedia> {
    const client = await this.getClient();
    const dimensions = VIDEO_DIMENSIONS[aspectRatio] ?? VIDEO_DIMENSIONS["16:9"];
    const results = (await client.run({
      taskType: "videoInference",
      model: process.env.RUNWARE_VIDEO_MODEL?.trim() || DEFAULT_VIDEO_MODEL,
      positivePrompt: prompt,
      ...dimensions,
      duration: durationSeconds,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "MP4",
      deliveryMethod: "async",
    })) as VideoInferenceResult[];

    const videoURL = results[0]?.videoURL;
    if (!videoURL) throw new Error("Runware returned no video URL");
    return this.downloadMedia(videoURL, "video/mp4", MAX_VIDEO_BYTES);
  }

  private async downloadMedia(
    mediaURL: string,
    fallbackMimeType: string,
    maxBytes: number,
  ): Promise<GeneratedMedia> {
    const url = new URL(mediaURL);
    if (url.protocol !== "https:" || !this.isRunwareHost(url.hostname)) {
      throw new Error("Runware returned an untrusted media URL");
    }

    const response = await fetch(url);
    const finalURL = new URL(response.url);
    if (finalURL.protocol !== "https:" || !this.isRunwareHost(finalURL.hostname)) {
      throw new Error("Runware redirected to an untrusted media URL");
    }
    if (!response.ok) {
      throw new Error(`Runware media download failed with status ${response.status}`);
    }

    const declaredSize = Number(response.headers.get("content-length") ?? 0);
    if (declaredSize > maxBytes) throw new Error("Runware media exceeds the size limit");

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) throw new Error("Runware returned empty media");
    if (buffer.length > maxBytes) throw new Error("Runware media exceeds the size limit");

    return {
      buffer,
      mimeType: response.headers.get("content-type")?.split(";")[0] || fallbackMimeType,
    };
  }

  private isRunwareHost(hostname: string): boolean {
    const normalized = hostname.toLowerCase();
    return normalized === "runware.ai" || normalized.endsWith(".runware.ai");
  }
}
