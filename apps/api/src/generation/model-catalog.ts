/**
 * Pricing matches the recon pricing/studio screenshots. Only a Gemini API
 * key is configured, so every model — including labels for providers we
 * don't have keys for (GPT Image, Runway's Gen-4/Gen-3 line) — actually
 * executes against a real Gemini/Veo model under the hood. Billing stays
 * per the label's advertised rate regardless of which Gemini model serves it.
 */

export interface ImageModelConfig {
  creditsCost: number;
  geminiModel: string;
}

export interface VideoModelConfig {
  creditsPerSecond: number;
  geminiModel: string;
}

export const IMAGE_MODELS: Record<string, ImageModelConfig> = {
  "gpt-image": { creditsCost: 2, geminiModel: "gemini-2.5-flash-image" },
  "nano-banana-2": { creditsCost: 1, geminiModel: "gemini-3.1-flash-image" },
  "nano-banana-2-4k": { creditsCost: 2, geminiModel: "gemini-3.1-flash-image" },
  "gen-4-image": { creditsCost: 1, geminiModel: "gemini-2.5-flash-image" },
};

export const VIDEO_MODELS: Record<string, VideoModelConfig> = {
  "veo-2": { creditsPerSecond: 3.0, geminiModel: "veo-3.1-generate-preview" },
  "veo-3-fast": { creditsPerSecond: 1.5, geminiModel: "veo-3.1-fast-generate-preview" },
  "veo-3": { creditsPerSecond: 3.0, geminiModel: "veo-3.1-generate-preview" },
  "gen-4-turbo": { creditsPerSecond: 1.0, geminiModel: "veo-3.1-fast-generate-preview" },
  "gen-4.5": { creditsPerSecond: 1.2, geminiModel: "veo-3.1-generate-preview" },
  "gen-3-alpha-turbo": { creditsPerSecond: 1.0, geminiModel: "veo-3.1-fast-generate-preview" },
};

export const ALL_IMAGE_MODEL_KEYS = Object.keys(IMAGE_MODELS);
export const ALL_VIDEO_MODEL_KEYS = Object.keys(VIDEO_MODELS);

export const ALLOWED_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];
// The recon screenshots show 5/8/10s options, but the real Veo 3.1 API this
// maps to only accepts 4-8s — 10s isn't achievable, so it's dropped here.
export const ALLOWED_VIDEO_DURATIONS = [5, 8];

export function computeCreditsCost(
  type: "IMAGE" | "VIDEO",
  model: string,
  durationSeconds: number | undefined,
): number {
  if (type === "IMAGE") {
    const config = IMAGE_MODELS[model];
    if (!config) {
      throw new Error(`Unknown image model: ${model}`);
    }
    return config.creditsCost;
  }

  const config = VIDEO_MODELS[model];
  if (!config) {
    throw new Error(`Unknown video model: ${model}`);
  }
  const duration = durationSeconds ?? ALLOWED_VIDEO_DURATIONS[0];
  return Math.ceil(config.creditsPerSecond * duration);
}
