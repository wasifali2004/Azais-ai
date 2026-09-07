import { getHistory as fetchHistoryPage } from "@/lib/generation-client";

export type HistoryItem = {
  id: string;
  type: "image" | "video";
  src: string;
  prompt: string;
  model: string;
  createdAt: string;
  aspect: "portrait" | "square" | "landscape";
};

function aspectFor(aspectRatio: unknown): HistoryItem["aspect"] {
  if (aspectRatio === "9:16" || aspectRatio === "3:4") return "portrait";
  if (aspectRatio === "1:1") return "square";
  return "landscape";
}

/** Fetches real generation history, keeping only completed items with output media. */
export async function fetchHistory(page = 1, limit = 50): Promise<HistoryItem[]> {
  const { items } = await fetchHistoryPage(page, limit);

  return items
    .filter((g) => g.status === "COMPLETE" && g.outputUrl)
    .map((g) => ({
      id: g.id,
      type: g.type === "VIDEO" ? "video" : "image",
      src: g.outputUrl as string,
      prompt: g.prompt,
      model: g.model,
      createdAt: g.createdAt,
      aspect: aspectFor(g.settings?.aspectRatio),
    }));
}
