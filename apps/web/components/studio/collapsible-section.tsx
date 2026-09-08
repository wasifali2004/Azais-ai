"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-border bg-bg p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-text"
      >
        {title}
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", open ? "rotate-180" : "")}
        />
      </button>
      {open && <div className="mt-4 border-t border-border-soft pt-4">{children}</div>}
    </section>
  );
}
