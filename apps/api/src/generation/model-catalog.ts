import type { PlanTier } from "../generated/prisma/enums";

/**
 * Pricing matches the recon pricing/studio screenshots. Each UI model maps
 * to a Gemini/Veo model first. Runware is the shared fallback when Gemini is
 * rate-limited or temporarily unavailable; billing remains based on the UI
 * model selected by the user.
 */

export type ModelTier = "FREE" | "PAID";

export interface ImageModelConfig {
  creditsCost: number;
  geminiModel: string;
  tier: ModelTier;
}

export interface VideoModelConfig {
  creditsPerSecond: number;
  geminiModel: string;
  tier: ModelTier;
  durations: number[];
}

// The recon screenshots show 5/8/10s options, but the real Veo 3.1 API this
// maps to only accepts 4-8s — 10s isn't achievable, so it's dropped here.
export const ALLOWED_VIDEO_DURATIONS = [5, 8];

export const IMAGE_MODELS: Record<string, ImageModelConfig> = {
  "gpt-image": { creditsCost: 2, geminiModel: "gemini-2.5-flash-image", tier: "PAID" },
  "nano-banana-2": { creditsCost: 1, geminiModel: "gemini-3.1-flash-image", tier: "FREE" },
  "nano-banana-2-4k": { creditsCost: 2, geminiModel: "gemini-3.1-flash-image", tier: "PAID" },
  "gen-4-image": { creditsCost: 1, geminiModel: "gemini-2.5-flash-image", tier: "FREE" },
};

export const VIDEO_MODELS: Record<string, VideoModelConfig> = {
  "veo-2": {
    creditsPerSecond: 3.0,
    geminiModel: "veo-3.1-generate-preview",
    tier: "PAID",
    durations: ALLOWED_VIDEO_DURATIONS,
  },
  "veo-3-fast": {
    creditsPerSecond: 1.5,
    geminiModel: "veo-3.1-fast-generate-preview",
    tier: "PAID",
    durations: ALLOWED_VIDEO_DURATIONS,
  },
  "veo-3": {
    creditsPerSecond: 3.0,
    geminiModel: "veo-3.1-generate-preview",
    tier: "PAID",
    durations: ALLOWED_VIDEO_DURATIONS,
  },
  "gen-4-turbo": {
    creditsPerSecond: 1.0,
    geminiModel: "veo-3.1-fast-generate-preview",
    tier: "FREE",
    durations: ALLOWED_VIDEO_DURATIONS,
  },
  "gen-4.5": {
    creditsPerSecond: 1.2,
    geminiModel: "veo-3.1-generate-preview",
    tier: "PAID",
    durations: ALLOWED_VIDEO_DURATIONS,
  },
  "gen-3-alpha-turbo": {
    creditsPerSecond: 1.0,
    geminiModel: "veo-3.1-fast-generate-preview",
    tier: "FREE",
    durations: ALLOWED_VIDEO_DURATIONS,
  },
};

export const ALL_IMAGE_MODEL_KEYS = Object.keys(IMAGE_MODELS);
export const ALL_VIDEO_MODEL_KEYS = Object.keys(VIDEO_MODELS);

export const ALLOWED_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];

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
  const duration = durationSeconds ?? config.durations[0];
  return Math.ceil(config.creditsPerSecond * duration);
}

/**
 * Validates settings against the chosen model's own catalog entry (rather
 * than one global rule) — throws a plain Error with a client-safe message
 * on failure; the caller maps it to a 400.
 */
export function validateSettings(
  type: "IMAGE" | "VIDEO",
  model: string,
  settings: { aspectRatio?: string; durationSeconds?: number } | undefined,
): void {
  if (settings?.aspectRatio && !ALLOWED_ASPECT_RATIOS.includes(settings.aspectRatio)) {
    throw new Error(`Unsupported aspect ratio: ${settings.aspectRatio}`);
  }

  if (type !== "VIDEO") return;

  const config = VIDEO_MODELS[model];
  if (!config) {
    throw new Error(`Unknown video model: ${model}`);
  }
  if (settings?.durationSeconds !== undefined && !config.durations.includes(settings.durationSeconds)) {
    throw new Error(
      `Model ${model} only supports durations of ${config.durations.join(", ")} seconds`,
    );
  }
}

export interface CatalogEntry {
  id: string;
  type: "IMAGE" | "VIDEO";
  tier: ModelTier;
  unlocked: boolean;
  aspectRatios: string[];
  durations?: number[];
  creditsCost?: number;
  creditsPerSecond?: number;
}

/**
 * Full model catalog for a given user's plan — the frontend's single
 * source of truth for cost, allowed durations/aspect ratios, and whether a
 * model is locked behind a paid plan.
 */
export function getModelCatalog(userPlan: PlanTier): { image: CatalogEntry[]; video: CatalogEntry[] } {
  const unlockedFor = (tier: ModelTier) => tier === "FREE" || userPlan !== "FREE";

  const image = Object.entries(IMAGE_MODELS).map(([id, config]) => ({
    id,
    type: "IMAGE" as const,
    tier: config.tier,
    unlocked: unlockedFor(config.tier),
    aspectRatios: ALLOWED_ASPECT_RATIOS,
    creditsCost: config.creditsCost,
  }));

  const video = Object.entries(VIDEO_MODELS).map(([id, config]) => ({
    id,
    type: "VIDEO" as const,
    tier: config.tier,
    unlocked: unlockedFor(config.tier),
    aspectRatios: ALLOWED_ASPECT_RATIOS,
    durations: config.durations,
    creditsPerSecond: config.creditsPerSecond,
  }));

  return { image, video };
}
