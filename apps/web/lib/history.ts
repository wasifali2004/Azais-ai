import { SHOWCASE_ITEMS } from "@/lib/media";

export type HistoryItem = {
  id: string;
  type: "image" | "video";
  src: string;
  prompt: string;
  model: string;
  createdAt: string;
  aspect: "portrait" | "square" | "landscape";
  credits: number;
};

const ASPECTS: HistoryItem["aspect"][] = ["landscape", "portrait", "square", "landscape", "portrait"];

/**
 * Mock generation history — replace with a real fetch to the API once
 * the history endpoint exists. Shape mirrors what the endpoint returns.
 */
export const HISTORY_ITEMS: HistoryItem[] = Array.from({ length: 10 }).map((_, i) => {
  const base = SHOWCASE_ITEMS[i % SHOWCASE_ITEMS.length];
  return {
    id: `${base.id}-${i}`,
    type: i % 4 === 0 ? "video" : "image",
    src: base.src,
    prompt: base.prompt,
    model: base.model,
    createdAt: new Date(Date.now() - i * 36e5 * 7).toISOString(),
    aspect: ASPECTS[i % ASPECTS.length],
    credits: i % 4 === 0 ? 5 : 2,
  };
});
