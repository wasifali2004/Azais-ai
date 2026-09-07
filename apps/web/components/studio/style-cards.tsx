"use client";

import { cn } from "@/lib/utils";

const STYLE_GRADIENTS: Record<string, string> = {
  None: "from-surface-2 to-surface",
  Cinematic: "from-[#3a2412] to-[#0f0906]",
  Anime: "from-[#5b2a4a] to-[#1a0e17]",
  Photo: "from-[#2c3a2f] to-[#0d120e]",
  Illustration: "from-[#3a2e12] to-[#120e05]",
};

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
    <div className="flex flex-wrap gap-2.5">
      {options.map((style) => {
        const active = style === value;
        return (
          <button
            key={style}
            type="button"
            onClick={() => onChange(style)}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-semibold text-white/40 ring-2 ring-offset-2 ring-offset-bg transition-all",
                STYLE_GRADIENTS[style] ?? "from-surface-2 to-surface",
                active ? "ring-accent" : "ring-transparent",
              )}
            >
              {style === "None" && "—"}
            </span>
            <span className={cn("text-xs font-medium", active ? "text-accent-hi" : "text-text-faint")}>
              {style}
            </span>
          </button>
        );
      })}
    </div>
  );
}
