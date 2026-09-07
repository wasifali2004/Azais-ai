export type ShowcaseItem = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  prompt: string;
  model: string;
};

/**
 * Hero / showcase media. Swap `src` (and `poster` for video) for final
 * generated assets when ready — everything downstream reads from this
 * array, nothing is hardcoded per-component.
 */
export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "fetch-bay",
    type: "image",
    src: "/showcase/sample-video-1.jpg",
    prompt:
      "An astronaut golden retriever levitates around an intergalactic space station with a tiny jet pack. Gorgeous specular lighting, 35mm film.",
    model: "Gen-4 Turbo",
  },
  {
    id: "valley-river",
    type: "image",
    src: "/showcase/sample-image-1.jpg",
    prompt:
      "A majestic mountain valley at golden hour with a serene river winding through, dramatic clouds overhead.",
    model: "Nano Banana 2",
  },
];
