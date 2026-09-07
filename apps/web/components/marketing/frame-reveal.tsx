"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BALL_SIZE = 320;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll-pinned reveal: a copper circle rises to center, then expands to
 * fill the screen, "inverting" the headline colour inside it — a moment of
 * emphasis between the model showcase and pricing sections. Tracks window
 * scroll directly (via the sticky child's own position) so it composes in
 * normal page flow instead of hijacking scroll in a nested container.
 */
export function FrameReveal() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ p1: 0, p2: 0 });
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const p1 = clamp(-rect.top / viewH);
      const p2 = clamp((-rect.top - viewH) / viewH);
      setProgress({ p1, p2 });
      setViewport({ w: window.innerWidth, h: viewH });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const { p1, p2 } = progress;
  const p1e = p1 < 0.5 ? 8 * p1 ** 4 : 1 - (-2 * p1 + 2) ** 4 / 2;
  const p2e = p2 * p2;

  const yOff = (1 - p1e) * (viewport.h / 2 + BALL_SIZE / 2);
  const coverSize = Math.max(viewport.w, viewport.h) * 2.6;
  const ballSize = BALL_SIZE + p2e * (coverSize - BALL_SIZE);
  const clipX = viewport.w / 2;
  const clipY = viewport.h / 2 + yOff;
  const clipR = ballSize / 2;

  return (
    <div ref={trackRef} className="relative h-[300vh]">
      <section className="sticky top-0 h-screen overflow-hidden bg-bg">
        <div
          className="absolute left-1/2 top-1/2 rounded-full bg-gradient-to-br from-accent-hi to-accent-lo"
          style={{
            width: ballSize,
            height: ballSize,
            transform: `translate(-50%, calc(-50% + ${yOff}px))`,
            willChange: "transform, width, height",
          }}
        />

        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-6 px-6 text-center">
          <h2 className="max-w-3xl text-balance font-display text-4xl font-medium leading-[1.05] text-text sm:text-5xl lg:text-6xl">
            Every prompt becomes a frame worth keeping.
          </h2>
          <p className="max-w-md text-sm text-text-faint sm:text-base">
            No storyboard, no crew, no render farm — just the shot you had in mind.
          </p>
          {/* invisible twin of the CTA below, kept only so this layer's centered
              content is the same height as the clipped layer — otherwise the two
              headlines land at slightly different y-positions and the reveal
              double-exposes instead of inverting cleanly */}
          <span aria-hidden className="invisible mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
            Open the studio
            <ArrowRight size={15} />
          </span>
        </div>

        <div
          className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-6 px-6 text-center"
          style={{ clipPath: `circle(${clipR}px at ${clipX}px ${clipY}px)` }}
        >
          <h2 className="max-w-3xl text-balance font-display text-4xl font-medium leading-[1.05] text-[#160c04] sm:text-5xl lg:text-6xl">
            Every prompt becomes a frame worth keeping.
          </h2>
          <p className="max-w-md text-sm text-[#160c04]/70 sm:text-base">
            No storyboard, no crew, no render farm — just the shot you had in mind.
          </p>
          <Link
            href="/studio/video"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#160c04] px-6 py-3 text-sm font-semibold text-white"
          >
            Open the studio
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
