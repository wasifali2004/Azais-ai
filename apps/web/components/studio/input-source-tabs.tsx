"use client";

import { Type, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function InputSourceTabs({
  value,
  onChange,
}: {
  value: "text" | "image";
  onChange: (v: "text" | "image") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-soft bg-bg p-1">
      {(
        [
          { key: "text" as const, label: "Text", icon: Type },
          { key: "image" as const, label: "Image", icon: ImageIcon },
        ]
      ).map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all",
            value === tab.key
              ? "bg-surface-2 text-text shadow-sm"
              : "text-text-faint hover:text-text-muted",
          )}
        >
          <tab.icon size={14} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
