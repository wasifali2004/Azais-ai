export type ModelBadge = "NEW" | "POPULAR" | "PREMIUM" | "FAST" | "4K" | null;

export type GenerationModel = {
  id: string;
  name: string;
  initials: string;
  badge: ModelBadge;
  costPerUnit: string;
  eta: string;
  hasAudio?: boolean;
};

export const VIDEO_MODELS: GenerationModel[] = [
  { id: "veo-2", name: "Veo 2", initials: "V2", badge: null, costPerUnit: "3.0 cr/s", eta: "~45s" },
  { id: "veo-3-fast", name: "Veo 3 Fast", initials: "V3", badge: "FAST", costPerUnit: "1.5 cr/s", eta: "~35s" },
  { id: "veo-3", name: "Veo 3", initials: "V3", badge: "NEW", costPerUnit: "3.0 cr/s", eta: "~1m", hasAudio: true },
  { id: "gen-4-turbo", name: "Gen-4 Turbo", initials: "G4", badge: "POPULAR", costPerUnit: "1.0 cr/s", eta: "~2m", hasAudio: true },
  { id: "gen-4-5", name: "Gen-4.5", initials: "G4", badge: "PREMIUM", costPerUnit: "1.2 cr/s", eta: "~2m" },
  { id: "gen-3-alpha-turbo", name: "Gen-3 Alpha Turbo", initials: "G3", badge: "FAST", costPerUnit: "1.0 cr/s", eta: "~1m", hasAudio: true },
];

export const IMAGE_MODELS: GenerationModel[] = [
  { id: "gpt-image", name: "GPT Image", initials: "GI", badge: "PREMIUM", costPerUnit: "2 cr", eta: "~10s" },
  { id: "nano-banana-2", name: "Nano Banana 2", initials: "NB", badge: "NEW", costPerUnit: "1 cr", eta: "~8s" },
  { id: "nano-banana-2-4k", name: "Nano Banana 2 4K", initials: "NB", badge: "4K", costPerUnit: "2 cr", eta: "~15s" },
  { id: "gen-4-image", name: "Gen-4 Image", initials: "G4", badge: "NEW", costPerUnit: "1 cr", eta: "~20s" },
];

export const IMAGE_STYLES = ["None", "Cinematic", "Anime", "Photo", "Illustration"] as const;

export const ASPECT_RATIOS = ["16:9", "1:1", "9:16", "4:3", "3:4"] as const;

export const VIDEO_DURATIONS = ["5s", "8s", "10s"] as const;
