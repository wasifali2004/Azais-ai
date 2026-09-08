"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function Hero({
  eyebrow = "Innovate Without Limits",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative isolate mx-auto flex min-h-[680px] w-full items-center justify-center overflow-hidden border-b border-border-soft bg-background px-6 py-24 text-center md:min-h-[calc(100svh-5rem)] md:px-8 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:6.5rem_5.5rem] [mask-image:radial-gradient(ellipse_85%_72%_at_50%_20%,#000_35%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[12%] -z-10 h-[520px] w-[min(1050px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0.04)_42%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.18)_0%,rgba(59,130,246,0.05)_44%,transparent_72%)]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-blue-50/80 to-transparent dark:from-blue-950/15" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
        {eyebrow && (
          <Link href="/pricing" className="group animate-fade-up">
            <span className="mx-auto flex w-fit items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-semibold tracking-[0.04em] text-muted-foreground shadow-sm backdrop-blur-md transition-colors group-hover:border-primary/40 group-hover:text-foreground">
              {eyebrow}
              <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        )}

        <h1 className="mt-7 max-w-4xl animate-fade-up bg-gradient-to-b from-foreground via-foreground to-foreground/55 bg-clip-text text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-transparent [animation-delay:100ms] sm:text-6xl md:text-7xl lg:text-[76px]">
          {title}
        </h1>

        <p className="mt-6 max-w-2xl animate-fade-up text-balance text-base leading-7 tracking-[-0.01em] text-muted-foreground [animation-delay:180ms] sm:text-lg md:text-xl">
          {subtitle}
        </p>

        {ctaLabel && (
          <div className="mt-8 animate-fade-up [animation-delay:260ms]">
            <InteractiveHoverButton text={ctaLabel} href={ctaHref} size="lg" />
          </div>
        )}

        <p className="mt-4 animate-fade-up text-xs font-medium text-muted-foreground [animation-delay:320ms]">
          Start with 8 free credits <span className="mx-1.5 text-border">•</span> No card required
        </p>
      </div>
    </section>
  );
}
