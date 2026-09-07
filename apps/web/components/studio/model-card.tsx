"use client";

import { motion } from "framer-motion";
import { Volume2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GenerationModel } from "@/lib/models";

const badgeTone: Record<string, "accent" | "solid" | "muted"> = {
  POPULAR: "solid",
  NEW: "accent",
  PREMIUM: "muted",
  FAST: "accent",
  "4K": "muted",
};

export function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: GenerationModel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
        selected
          ? "border-accent/60 bg-accent-wash shadow-[0_0_0_1px_var(--accent)_inset,0_12px_28px_-14px_var(--accent)]"
          : "border-border-soft bg-surface hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_14px_30px_-16px_var(--accent)]",
      )}
    >
      {model.badge && (
        <Badge tone={badgeTone[model.badge] ?? "accent"} className="absolute right-3 top-3">
          {model.badge}
        </Badge>
      )}
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg font-display text-sm font-medium transition-colors",
          selected ? "bg-accent text-[#160c04]" : "bg-surface-2 text-accent-hi",
        )}
      >
        {model.initials}
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-text">
          {model.name}
          {model.hasAudio && <Volume2 size={12} className="text-text-faint" />}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-text-faint">
          <Zap size={11} className="text-accent-hi" />
          {model.costPerUnit} · {model.eta}
        </p>
      </div>
    </motion.button>
  );
}
