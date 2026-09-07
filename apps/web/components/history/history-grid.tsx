"use client";

import { motion } from "framer-motion";
import { Download, Film, Sparkle } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";
import type { HistoryItem } from "@/lib/history";

const ASPECT_CLASS: Record<HistoryItem["aspect"], string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HistoryGrid({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
        <Sparkle size={22} className="text-text-faint" />
        <p className="text-sm text-text-faint">Nothing here yet — your generations will show up in this view.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger(0.05)}
      initial="hidden"
      animate="show"
      className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={fadeUp}
          className={`group relative overflow-hidden rounded-xl border border-border-soft bg-surface ${ASPECT_CLASS[item.aspect]} break-inside-avoid`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.prompt} className="h-full w-full object-cover" />

          {item.type === "video" && (
            <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
              <Film size={12} />
            </span>
          )}

          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/10 to-transparent p-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="line-clamp-2 text-xs leading-snug text-white/90">{item.prompt}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                {item.model} · {formatDate(item.createdAt)}
              </span>
              <button
                type="button"
                aria-label="Download"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <Download size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
