"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import { LANGUAGES } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // Fixed h-9/w-9 footprint matching ThemeToggle, and the picker itself is
    // `absolute` — opening it never changes this element's box, so it can't
    // push or shrink the buttons next to it in the navbar's flex row.
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft bg-surface text-text-muted shadow-sm transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-accent-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <Globe size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute end-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/10 dark:shadow-black/40"
          >
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={lang === language.code}
                onClick={() => {
                  setLang(language.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  lang === language.code ? "font-semibold text-text" : "text-text-muted",
                )}
              >
                {language.nativeLabel}
                {lang === language.code && <Check size={14} className="text-accent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
