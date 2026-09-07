"use client";

import * as React from "react";
import { motion } from "framer-motion";

export type ImageGenerationLoadingState = "starting" | "generating" | "completed";

export interface ImageGenerationProps {
  children: React.ReactNode;
  /** Driven by the real poll loop — not an internal fake timer. */
  loadingState: ImageGenerationLoadingState;
  /** 0-100, elapsed-time / estimated-duration for the selected model. */
  progress: number;
  generatingLabel?: string;
}

export const ImageGeneration = ({
  children,
  loadingState,
  progress,
  generatingLabel = "Creating. May take a moment.",
}: ImageGenerationProps) => {
  return (
    <div className="flex flex-col gap-2">
      <motion.span
        className="bg-[linear-gradient(110deg,var(--color-muted-foreground),35%,var(--color-foreground),50%,var(--color-muted-foreground),75%,var(--color-muted-foreground))] bg-[length:200%_100%] bg-clip-text text-transparent text-base font-medium"
        initial={{ backgroundPosition: "200% 0" }}
        animate={{
          backgroundPosition: loadingState === "completed" ? "0% 0" : "-200% 0",
        }}
        transition={{
          repeat: loadingState === "completed" ? 0 : Infinity,
          duration: 3,
          ease: "linear",
        }}
      >
        {loadingState === "starting" && "Getting started."}
        {loadingState === "generating" && generatingLabel}
        {loadingState === "completed" && "Done."}
      </motion.span>
      <div className="relative rounded-xl border bg-card max-w-md overflow-hidden">
        {children}
        <motion.div
          className="absolute w-full h-[125%] -top-[25%] pointer-events-none backdrop-blur-3xl"
          initial={false}
          animate={{
            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
            opacity: loadingState === "completed" ? 0 : 1,
          }}
          style={{
            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
            maskImage:
              progress === 0
                ? "linear-gradient(to bottom, black -5%, black 100%)"
                : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
            WebkitMaskImage:
              progress === 0
                ? "linear-gradient(to bottom, black -5%, black 100%)"
                : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
          }}
        />
      </div>
    </div>
  );
};

ImageGeneration.displayName = "ImageGeneration";

export default ImageGeneration;
