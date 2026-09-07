"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { SHOWCASE_ITEMS } from "@/lib/media";

const INTERVAL_MS = 5200;

export function HeroShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (SHOWCASE_ITEMS.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SHOWCASE_ITEMS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const item = SHOWCASE_ITEMS[index];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border-soft bg-surface sm:aspect-[16/11] lg:aspect-[4/3]">
      <AnimatePresence mode="sync">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {item.type === "video" ? (
            <video
              src={item.src}
              poster={item.poster}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt={item.prompt} className="h-full w-full object-cover" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm">
        <Volume2 size={14} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
        <div className="max-w-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-hi">
            Example · {item.model}
          </span>
          <p className="mt-1.5 text-sm leading-snug text-white/85">{item.prompt}</p>
        </div>
        <div className="flex shrink-0 gap-1.5 pb-0.5">
          {SHOWCASE_ITEMS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show example ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 20 : 8,
                background: i === index ? "var(--accent-hi)" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
