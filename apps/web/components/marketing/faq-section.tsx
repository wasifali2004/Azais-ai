"use client";

import { useMemo } from "react";
import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
import { useLanguage } from "@/lib/i18n/context";

const ICONS: { icon: string; position: "left" | "right" }[] = [
  { icon: "🎬", position: "right" },
  { icon: "💳", position: "left" },
  { icon: "🔄", position: "right" },
  { icon: "🔀", position: "left" },
  { icon: "🔒", position: "right" },
];

export function FaqSection() {
  const { t } = useLanguage();

  const data = useMemo(
    () =>
      t.faq.items.map((item, index) => ({
        id: index + 1,
        question: item.question,
        answer: item.answer,
        icon: ICONS[index]?.icon,
        iconPosition: ICONS[index]?.position,
      })),
    [t],
  );

  return (
    <section id="faq" className="scroll-mt-20 border-t border-border-soft bg-bg py-20 sm:py-28" aria-labelledby="faq-title">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="mx-auto mb-12 flex max-w-xl flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{t.faq.eyebrow}</p>
          <h2 id="faq-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl">
            {t.faq.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-text-muted">{t.faq.subtitle}</p>
        </div>

        <FaqAccordion
          data={data}
          timestamp={t.faq.timestamp}
          className="mx-auto w-full max-w-3xl p-0"
          questionClassName="bg-surface-2 hover:bg-accent-wash"
          answerClassName="bg-accent text-white"
        />
      </div>
    </section>
  );
}
