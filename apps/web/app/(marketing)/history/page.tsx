"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HistoryGrid } from "@/components/history/history-grid";
import { HISTORY_ITEMS } from "@/lib/history";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Image", "Video"] as const;

export default function HistoryPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const items = useMemo(() => {
    if (filter === "All") return HISTORY_ITEMS;
    return HISTORY_ITEMS.filter((i) => i.type === filter.toLowerCase());
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-medium text-text">History</h1>
        <p className="text-sm text-text-faint">Every video and image you&apos;ve generated, in one place.</p>
      </motion.div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f
                ? "border-accent/50 bg-accent-wash text-accent-hi"
                : "border-border-soft text-text-muted hover:text-text",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <HistoryGrid items={items} />
      </div>
    </div>
  );
}
