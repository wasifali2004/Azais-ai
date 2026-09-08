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
    <div className="flex flex-wrap gap-1.5">
      {options.map((style) => {
        const active = style === value;
        return (
          <button
            key={style}
            type="button"
            onClick={() => onChange(style)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-accent/50 bg-accent-wash text-accent-hi"
                : "border-border-soft bg-bg text-text-faint hover:border-border hover:text-text-muted",
            )}
          >
            {style}
          </button>
        );
      })}
    </div>
  );
}
