"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="w-full bg-bg pb-28 pt-20 text-center sm:pt-28">
      <Link
        href="/pricing"
        className="mx-auto flex w-max items-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm text-text-muted transition-colors hover:border-text/30 hover:text-text"
      >
        <span>New: Veo 3 &amp; Gen-4.5 are live</span>
        <span className="flex items-center gap-1 font-medium text-text">
          Read more
          <ArrowRight size={14} />
        </span>
      </Link>

      <h1 className="mx-auto mt-8 max-w-4xl px-4 text-center font-display text-4xl font-medium leading-[1.05] text-text md:text-7xl">
        Cinematic video &amp; images, one prompt away
      </h1>

      <p className="mx-auto mt-6 max-w-2xl px-4 text-center text-base text-text-muted">
        Generate finished video and image content with every leading model in one studio — no
        storyboard, no render farm, just the shot you had in mind.
      </p>

      <div className="mx-auto mt-8 flex w-full items-center justify-center gap-3">
        <Button href="/signup" variant="primary" size="lg" className="gap-1.5">
          Get Started
        </Button>
        <Button href="/studio/video" variant="outline" size="lg" className="gap-1.5">
          Explore the studio
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  );
}
