"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

const STAGES = ["Reading prompt", "Composing frame", "Rendering", "Finishing touches"];

export function GenerationProgress({ etaLabel }: { etaLabel: string }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-full min-h-130 w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-wash),transparent_65%)]" />

      <div className="relative flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-accent"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.05, 0.85] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-1.5 text-center">
        <p className="flex items-center gap-1.5 text-sm font-medium text-text">
          <Sparkle size={14} className="text-accent-hi" />
          {STAGES[stage]}
        </p>
        <p className="text-xs text-text-faint">Estimated time · {etaLabel}</p>
      </div>

      <div className="relative h-1 w-48 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-lo via-accent to-accent-hi"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
