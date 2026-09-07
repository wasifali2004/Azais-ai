"use client";

import { Wand2, Shuffle } from "lucide-react";

export function PromptBox({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-accent-hi"
          >
            <Wand2 size={12} />
            Enhance
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-accent-hi"
          >
            <Shuffle size={12} />
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
