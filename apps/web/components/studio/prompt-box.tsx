"use client";

import { Loader2, Shuffle, Wand2 } from "lucide-react";

export function PromptBox({
  label,
  value,
  onChange,
  placeholder,
  onEnhance,
  onVariation,
  busy,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onEnhance?: () => void;
  onVariation?: () => void;
  busy?: "enhance" | "variation" | null;
}) {
  const disabled = !value.trim() || !!busy;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEnhance}
            disabled={disabled}
            className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-accent-hi disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "enhance" ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Enhance
          </button>
          <button
            type="button"
            onClick={onVariation}
            disabled={disabled}
            className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-accent-hi disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "variation" ? <Loader2 size={12} className="animate-spin" /> : <Shuffle size={12} />}
            Variation
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-border-soft bg-surface p-3.5 text-sm text-text placeholder:text-text-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
