"use client";

import { motion } from "framer-motion";
import { Check, Lock, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerationModel } from "@/lib/models";

export function ModelCard({
  model,
  selected,
  onSelect,
  disabled = false,
  disabledReason,
}: {
  model: GenerationModel;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onSelect}
      aria-disabled={disabled}
      aria-pressed={selected}
      title={disabled ? disabledReason : undefined}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors duration-150",
        disabled && "cursor-not-allowed border-border-soft bg-surface opacity-50",
        !disabled &&
          (selected ? "border-accent/50 bg-accent-wash" : "border-border-soft bg-surface hover:border-border"),
      )}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium text-text">
          <span className="truncate">{model.name}</span>
          {model.hasAudio && <Volume2 size={12} className="shrink-0 text-text-faint" />}
        </p>
        <p className="mt-0.5 text-xs text-text-faint">
          {model.costPerUnit} · {model.eta}
          {model.badge && !disabled && <span className="text-text-faint/80"> · {model.badge}</span>}
        </p>
      </div>

      {disabled ? (
        <Lock size={14} className="shrink-0 text-text-faint" />
      ) : (
        selected && <Check size={15} className="shrink-0 text-accent-hi" />
      )}
    </motion.button>
  );
}
