"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Pricing, type PricingPlan } from "@/components/blocks/pricing";

export function PricingModal({
  open,
  onClose,
  plans,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  plans: PricingPlan[];
  title?: string;
  description?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "Pricing"}
            className="fixed inset-x-4 top-[4svh] z-[101] mx-auto max-h-[92svh] max-w-5xl overflow-y-auto rounded-2xl border border-border-soft bg-background shadow-2xl sm:inset-x-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-soft bg-surface text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
            >
              <X size={16} />
            </button>
            <Pricing plans={plans} title={title} description={description} compact />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
