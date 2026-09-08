"use client";

import type { ComponentProps, ReactNode } from "react";
import { Clock3, Cpu, Fingerprint, Sparkles, SlidersHorizontal, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { useLanguage } from "@/lib/i18n/context";

// Order matches `features.items` in each language dictionary.
const FEATURE_ICONS = [Zap, Cpu, SlidersHorizontal, Clock3, Fingerprint, Sparkles];

export function FeatureGridSection() {
  const { t } = useLanguage();
  const features = t.features.items.map((item, index) => ({ ...item, icon: FEATURE_ICONS[index] }));

  return (
    <section id="features" className="scroll-mt-20 bg-bg py-20 sm:py-28" aria-labelledby="features-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <AnimatedContainer className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{t.features.eyebrow}</p>
          <h2 id="features-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl">
            {t.features.title}
          </h2>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="mt-10 grid grid-cols-1 divide-x divide-y divide-dashed divide-border border border-dashed border-border sm:grid-cols-2 md:grid-cols-3"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
