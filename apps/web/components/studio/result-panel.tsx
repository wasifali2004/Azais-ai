"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, EyeOff, RotateCcw } from "lucide-react";
import { GenerationProgress } from "@/components/studio/generation-progress";
import { Button } from "@/components/ui/button";
import type { ShowcaseItem } from "@/lib/media";

export type StudioStatus = "idle" | "loading" | "done";

export function ResultPanel({
  status,
  example,
  eta,
  onReset,
  onHideExample,
  exampleHidden,
}: {
  status: StudioStatus;
  example: ShowcaseItem;
  eta: string;
  onReset: () => void;
  onHideExample: () => void;
  exampleHidden: boolean;
}) {
  return (
    <div className="h-full min-h-130 w-full">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GenerationProgress etaLabel={eta} />
          </motion.div>
        )}

        {status === "done" && (
          <motion.div
            key="done"
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full min-h-130 w-full overflow-hidden rounded-2xl border border-accent/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={example.src} alt="Generated result" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="text-xs font-medium text-white/80">Generated · {example.model}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <RotateCcw size={12} />
                  New
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#160c04] transition-colors hover:brightness-105"
                >
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full min-h-130 w-full overflow-hidden rounded-2xl border border-border-soft bg-surface"
          >
            {!exampleHidden && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={example.src} alt={example.prompt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <button
                  type="button"
                  onClick={onHideExample}
                  className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-black/55"
                >
                  <EyeOff size={12} />
                  Hide example
                </button>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-hi">
                    Example · {example.model}
                  </span>
                  <p className="mt-1.5 max-w-md text-sm leading-snug text-white/85">{example.prompt}</p>
                </div>
              </>
            )}
            {exampleHidden && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-text-faint">Your generation will appear here</p>
                <Button variant="outline" size="sm" onClick={onHideExample}>
                  Show example
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
