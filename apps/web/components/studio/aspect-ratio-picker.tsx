"use client";

import { cn } from "@/lib/utils";

const SHAPES: Record<string, string> = {
  "16:9": "w-7 h-4",
  "1:1": "w-5 h-5",
  "9:16": "w-4 h-7",
  "4:3": "w-6 h-[18px]",
  "3:4": "w-[18px] h-6",
};

export function AspectRatioPicker({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {options.map((ratio) => {
        const active = ratio === value;
        return (
          <button
            key={ratio}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(ratio)}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-2 rounded-lg border py-3 text-xs font-medium transition-colors",
              active
                ? "border-accent bg-accent-wash text-accent-hi"
                : "border-border-soft bg-surface text-text-faint hover:border-border hover:text-text-muted",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-sm border-2 transition-colors",
                SHAPES[ratio] ?? "h-5 w-5",
                active ? "border-accent-hi" : "border-text-faint",
              )}
            />
            {ratio}
          </button>
        );
      })}
    </div>
  );
}
