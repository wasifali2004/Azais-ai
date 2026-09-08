"use client";

import { cn } from "@/lib/utils";

export function StyleCards({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((style) => {
        const active = style === value;
        return (
          <button
            key={style}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(style)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-accent bg-accent-wash text-accent-hi"
                : "border-border-soft bg-surface text-text-muted hover:border-border hover:bg-surface-2",
            )}
          >
            {style}
          </button>
        );
      })}
    </div>
  );
}
