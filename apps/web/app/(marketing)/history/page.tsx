"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { HistoryGrid } from "@/components/history/history-grid";
import { fetchHistory, type HistoryItem } from "@/lib/history";
import { fadeUp } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "image" | "video";

export default function HistoryPage() {
  const { t } = useLanguage();
  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: t.historyPage.filterAll },
    { key: "image", label: t.studio.image },
    { key: "video", label: t.studio.video },
  ];
  const [filter, setFilter] = useState<FilterKey>("all");
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then(setAllItems)
      .catch(() => setAllItems([]))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(() => {
    if (filter === "all") return allItems;
    return allItems.filter((i) => i.type === filter);
  }, [filter, allItems]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Link
        href="/studio/image"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {t.studio.backToStudio}
      </Link>

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-medium text-text">{t.historyPage.title}</h1>
        <p className="text-sm text-text-faint">{t.historyPage.subtitle}</p>
      </motion.div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "border-accent/50 bg-accent-wash text-accent-hi"
                : "border-border-soft text-text-muted hover:text-text",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="py-24 text-center text-sm text-text-faint">{t.historyPage.loading}</p>
        ) : (
          <HistoryGrid items={items} />
        )}
      </div>
    </div>
  );
}
