"use client";

import { cn } from "@/lib/utils";

const SHAPES: Record<string, string> = {
  "16:9": "w-[22px] h-[13px]",
  "1:1": "w-[18px] h-[18px]",
  "9:16": "w-[13px] h-[22px]",
  "4:3": "w-[20px] h-[15px]",
  "3:4": "w-[15px] h-[20px]",
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
    <div className="flex flex-wrap gap-2">
      {options.map((ratio) => {
        const active = ratio === value;
        return (
          <button
            key={ratio}
            type="button"
            onClick={() => onChange(ratio)}
            className={cn(
              "flex w-16 flex-col items-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all",
              active
                ? "border-accent/60 bg-accent-wash text-accent-hi"
                : "border-border-soft bg-surface text-text-faint hover:border-border hover:text-text-muted",
            )}
          >
            <span
              className={cn(
                "rounded-[3px] border-2",
                SHAPES[ratio] ?? "w-5 h-5",
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
