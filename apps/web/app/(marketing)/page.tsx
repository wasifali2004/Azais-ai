"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Clapperboard, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { FrameReveal } from "@/components/marketing/frame-reveal";
import { WorldMap } from "@/components/marketing/world-map";
import { PricingCard } from "@/components/marketing/pricing-card";
import { Footer } from "@/components/marketing/footer";
import { VIDEO_MODELS, IMAGE_MODELS } from "@/lib/models";
import { PRICING_PLANS } from "@/lib/pricing";
import { CREATOR_ROUTES } from "@/lib/map-routes";
import { fadeUp, fadeIn, stagger } from "@/lib/motion";

const FEATURED_MODELS = [...VIDEO_MODELS.slice(2, 4), ...IMAGE_MODELS.slice(0, 2)];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Now with Veo 3 &amp; Gen-4.5
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-balance text-text sm:text-5xl lg:text-[3.4rem]">
              Cinematic <em className="font-display italic text-accent">generation</em>, without the noise.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-muted">
              Turn a sentence into finished video or image work — every leading model in one
              studio, tuned for people who care how the frame looks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/signup" variant="primary" size="lg">
                Start free — 8 credits
                <ArrowRight size={16} />
              </Button>
              <Button href="/studio/video" variant="outline" size="lg">
                Explore the studio
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-5 text-xs text-text-faint">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-accent-hi" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-accent-hi" /> Cancel anytime
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
          >
            <HeroShowcase />
          </motion.div>
        </div>
      </section>

      {/* Model showcase */}
      <motion.section
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8"
      >
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-hi">
            Models
          </span>
          <h2 className="font-display text-3xl font-medium text-text">
            Every model worth using, one prompt away.
          </h2>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_MODELS.map((model) => (
            <motion.div
              key={model.id}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="relative flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-5 hover:border-accent/30 hover:shadow-[0_16px_36px_-18px_var(--accent)]"
            >
              {model.badge && (
                <Badge className="absolute right-4 top-4" tone={model.badge === "POPULAR" ? "solid" : "accent"}>
                  {model.badge}
                </Badge>
              )}
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-wash font-display text-base font-medium text-accent-hi">
                {model.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-text">{model.name}</p>
                <p className="mt-0.5 text-xs text-text-faint">{model.costPerUnit} · {model.eta}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/studio/video"
            className="flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-accent-hi"
          >
            <Clapperboard size={15} /> Open Video Studio <ArrowRight size={13} />
          </Link>
          <Link
            href="/studio/image"
            className="flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-accent-hi"
          >
            <ImageIcon size={15} /> Open Image Studio <ArrowRight size={13} />
          </Link>
        </motion.div>
      </motion.section>

      {/* Scroll-pinned reveal */}
      <FrameReveal />

      {/* Global network */}
      <motion.section
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-hi">
            Community
          </span>
          <h2 className="font-display text-3xl font-medium text-text">A studio without borders.</h2>
          <p className="max-w-md text-sm text-text-faint">
            Creators on every continent are rendering with AzaisAi right now — one prompt, one frame, one feed.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-10">
          <WorldMap routes={CREATOR_ROUTES} />
        </motion.div>
      </motion.section>

      {/* Pricing preview */}
      <motion.section
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-hi">
            Pricing
          </span>
          <h2 className="font-display text-3xl font-medium text-text">Plans that scale with output.</h2>
          <p className="max-w-md text-sm text-text-faint">Cancel anytime. No hidden fees, no watermarks on paid plans.</p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-5xl px-5 py-16 sm:px-8"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface px-8 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-wash),transparent_60%)]" />
          <h2 className="relative font-display text-3xl font-medium text-balance text-text sm:text-4xl">
            Your next frame is one prompt away.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-text-muted">
            Join creators using AzaisAi to ship finished video and image work in minutes, not days.
          </p>
          <div className="relative mt-7 flex justify-center">
            <Button href="/signup" variant="primary" size="lg">
              Start free — 8 credits
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
}
