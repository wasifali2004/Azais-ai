"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { getSession, SESSION_EVENT } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";

interface VerticalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
  onItemsRef?: (items: HTMLElement[]) => void;
}

function VerticalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
  onItemsRef,
}: VerticalMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onItemsRef && containerRef.current) {
      const items = Array.from(containerRef.current.querySelectorAll(".marquee-item")) as HTMLElement[];
      onItemsRef(items);
    }
  }, [onItemsRef]);

  return (
    <div
      ref={containerRef}
      className={cn("group flex flex-col overflow-hidden", className)}
      style={
        {
          "--duration": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 flex-col animate-marquee-vertical",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col animate-marquee-vertical",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default function CTAWithVerticalMarquee() {
  const { t } = useLanguage();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const syncSession = () => setSignedIn(!!getSession());
    syncSession();
    window.addEventListener(SESSION_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(SESSION_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll(".marquee-item");
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.75;
        (item as HTMLElement).style.opacity = opacity.toString();
      });
    };

    const animationFrame = () => {
      updateOpacity();
      requestAnimationFrame(animationFrame);
    };

    const frame = requestAnimationFrame(animationFrame);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="overflow-hidden bg-bg px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl animate-fade-in-up">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Left content */}
          <div className="max-w-xl space-y-8">
            <h2 className="animate-fade-in-up text-balance text-5xl font-medium leading-tight tracking-tight text-text [animation-delay:200ms] md:text-6xl lg:text-7xl">
              {t.ctaMarquee.title}
            </h2>
            <p className="animate-fade-in-up text-lg leading-relaxed text-text-muted [animation-delay:400ms] md:text-xl">
              {t.ctaMarquee.subtitle}
            </p>
            <div className="flex animate-fade-in-up flex-wrap gap-4 [animation-delay:600ms]">
              <InteractiveHoverButton
                href={signedIn ? "/studio/image" : "/signup?next=/studio/image"}
                text={signedIn ? t.nav.openStudio : t.ctaMarquee.ctaStart}
                size="lg"
              />
              <InteractiveHoverButton href="/studio/video" text={t.ctaMarquee.ctaExplore} size="lg" />
            </div>
          </div>

          {/* Right marquee */}
          <div
            ref={marqueeRef}
            className="relative flex h-[600px] animate-fade-in-up items-center justify-center [animation-delay:400ms] lg:h-[700px]"
          >
            <div className="relative h-full w-full">
              <VerticalMarquee speed={20} className="h-full">
                {t.ctaMarquee.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="marquee-item py-8 text-4xl font-light tracking-tight text-text md:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>

              {/* Top vignette */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-64 bg-gradient-to-b from-bg via-bg/50 to-transparent" />

              {/* Bottom vignette */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
