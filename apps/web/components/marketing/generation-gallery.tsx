"use client";

import {
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/ui/animated-gallery";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clapperboard } from "lucide-react";

/**
 * Same two real showcase stills (cropped from /recon) repeated across the
 * gallery — deliberately not a set of unrelated stock photos. Swap these
 * paths for more generated examples as they become available.
 */
const IMAGES_1 = [
  "/showcase/sample-video-1.jpg",
  "/showcase/sample-image-1.jpg",
  "/showcase/sample-video-1.jpg",
  "/showcase/sample-image-1.jpg",
];
const IMAGES_2 = [
  "/showcase/sample-image-1.jpg",
  "/showcase/sample-video-1.jpg",
  "/showcase/sample-image-1.jpg",
  "/showcase/sample-video-1.jpg",
];
const IMAGES_3 = [
  "/showcase/sample-video-1.jpg",
  "/showcase/sample-image-1.jpg",
  "/showcase/sample-video-1.jpg",
  "/showcase/sample-image-1.jpg",
];

export function GenerationGallery() {
  return (
    <div className="relative bg-background text-foreground">
      <ContainerStagger className="relative z-[9999] -mb-12 place-self-center px-6 pt-12 text-center">
        <ContainerAnimated>
          <h2 className="font-display text-4xl font-medium md:text-5xl">
            Your <span className="italic text-accent">one studio</span>
          </h2>
        </ContainerAnimated>
        <ContainerAnimated>
          <h2 className="font-display text-4xl font-medium md:text-5xl">for every generation</h2>
        </ContainerAnimated>

        <ContainerAnimated className="my-4">
          <p className="leading-normal tracking-tight text-text-faint">
            No storyboard, no render farm, no wasted credits — just the frame
            <br /> you had in mind, generated in one place.
          </p>
        </ContainerAnimated>

        <ContainerAnimated className="flex items-center justify-center gap-2">
          <Button href="/signup" variant="primary" size="md" className="gap-1.5">
            Start free <ArrowRight className="size-4" />
          </Button>
          <Button href="/pricing" variant="ghost" size="md" className="gap-1.5">
            <Clapperboard className="size-4" /> View pricing
          </Button>
        </ContainerAnimated>
      </ContainerStagger>

      <ContainerScroll className="relative h-[350vh]">
        <ContainerSticky className="h-svh">
          <GalleryContainer>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_1.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="AzaisAi generation example"
                />
              ))}
            </GalleryCol>
            <GalleryCol className="mt-[-50%]" yRange={["15%", "5%"]}>
              {IMAGES_2.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="AzaisAi generation example"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_3.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="AzaisAi generation example"
                />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
    </div>
  );
}
