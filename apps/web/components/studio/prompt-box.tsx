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
    <div className="rounded-2xl border border-border bg-bg p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEnhance}
            disabled={disabled}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-accent-hi disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "enhance" ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Enhance
          </button>
          <button
            type="button"
            onClick={onVariation}
            disabled={disabled}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-accent-hi disabled:cursor-not-allowed disabled:opacity-50"
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
        className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-6 text-text outline-none placeholder:text-text-faint focus:ring-0"
      />
    </div>
  );
}
