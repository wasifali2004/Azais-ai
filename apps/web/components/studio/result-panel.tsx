"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Download, EyeOff, RotateCcw } from "lucide-react";
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1";
import { Button } from "@/components/ui/button";
import type { ShowcaseItem } from "@/lib/media";

export type StudioStatus = "idle" | "loading" | "done" | "failed";

/** "~45s" / "~1m" / "~2m" -> milliseconds, used only to pace the progress bar. */
function parseEtaMs(eta: string): number {
  const match = eta.match(/(\d+)\s*(s|m)/i);
  if (!match) return 30_000;
  const value = Number(match[1]);
  return match[2].toLowerCase() === "m" ? value * 60_000 : value * 1_000;
}

function useElapsedMs(active: boolean, startedAt: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [active]);

  if (!startedAt) return 0;
  return Math.max(0, now - startedAt);
}

export function ResultPanel({
  status,
  example,
  eta,
  startedAt,
  outputUrl,
  failureMessage,
  onReset,
  onHideExample,
  exampleHidden,
}: {
  status: StudioStatus;
  example: ShowcaseItem;
  eta: string;
  startedAt: number | null;
  outputUrl?: string | null;
  failureMessage?: string | null;
  onReset: () => void;
  onHideExample: () => void;
  exampleHidden: boolean;
}) {
  const elapsedMs = useElapsedMs(status === "loading", startedAt);
  const estimatedMs = parseEtaMs(eta);
  const loadingState = elapsedMs === 0 ? "starting" : "generating";
  // Cap at 96% while still pending — the real jump to 100 happens once the
  // poll confirms COMPLETE, not on a timer, so it never "finishes" early.
  const progress = Math.min(96, (elapsedMs / estimatedMs) * 100);

  return (
    <div className="h-full min-h-130 w-full">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-130 w-full items-center justify-center rounded-2xl border border-border-soft bg-surface p-6"
          >
            <ImageGeneration loadingState={loadingState} progress={progress}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={example.src} alt="" className="aspect-video w-full max-w-md object-cover" />
            </ImageGeneration>
          </motion.div>
        )}

        {status === "done" && outputUrl && (
          <motion.div
            key="done"
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full min-h-130 w-full overflow-hidden rounded-2xl border border-accent/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={outputUrl} alt="Generated result" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="text-xs font-medium text-white/80">Generated</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <RotateCcw size={12} />
                  New
                </button>
                <a
                  href={outputUrl}
                  download
                  className="flex items-center gap-1.5 rounded-lg bg-text px-3 py-1.5 text-xs font-semibold text-bg transition-colors hover:opacity-90"
                >
                  <Download size={12} />
                  Download
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-130 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border-soft bg-surface p-8 text-center"
          >
            <AlertCircle size={22} className="text-text-faint" />
            <p className="max-w-sm text-sm text-text-muted">
              {failureMessage ?? "We couldn't generate that — your credits have been refunded."}
            </p>
            <Button variant="outline" size="sm" onClick={onReset}>
              Try again
            </Button>
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
