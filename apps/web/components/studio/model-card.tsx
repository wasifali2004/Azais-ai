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
      title={disabled ? disabledReason : undefined}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      className={cn(
        "group relative flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150",
        disabled && "cursor-not-allowed border-border-soft bg-bg opacity-50",
        !disabled &&
          (selected
            ? "border-accent/50 bg-accent-wash"
            : "border-border-soft bg-bg hover:border-border"),
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-text">
          {model.name}
          {model.hasAudio && <Volume2 size={11} className="text-text-faint" />}
        </p>
        {disabled ? (
          <Lock size={12} className="shrink-0 text-text-faint" />
        ) : (
          selected && <Check size={13} className="shrink-0 text-accent-hi" />
        )}
      </div>
      <p className="text-xs text-text-faint">
        {model.costPerUnit} · {model.eta}
        {model.badge && !disabled && <span className="ml-1 text-text-faint/80">· {model.badge}</span>}
      </p>
    </motion.button>
  );
}
