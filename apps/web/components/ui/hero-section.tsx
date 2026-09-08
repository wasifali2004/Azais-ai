"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { useLanguage } from "@/lib/i18n/context";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-bg">
      <GridPattern
        width={48}
        height={48}
        x={-1}
        y={-1}
        className="mask-[radial-gradient(closest-side,white,transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28">
        <h1
          style={{ animationDelay: "100ms" }}
          className="animate-fade-up mx-auto mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-text sm:text-6xl lg:text-7xl"
        >
          {t.hero.title}
        </h1>
        <p
          style={{ animationDelay: "180ms" }}
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-text-muted sm:text-lg"
        >
          {t.hero.subtitle}
        </p>

        <div
          style={{ animationDelay: "260ms" }}
          className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <InteractiveHoverButton
            href="/signup?next=/studio/image"
            text={t.hero.ctaStart}
            size="lg"
            className="w-full sm:w-auto"
          />
          <InteractiveHoverButton href="/studio/video" text={t.hero.ctaExplore} size="lg" className="w-full sm:w-auto" />
        </div>
        <p style={{ animationDelay: "320ms" }} className="animate-fade-up mt-3 text-xs text-text-faint">
          {t.hero.freeCredits}
        </p>
      </div>
    </section>
  );
}
