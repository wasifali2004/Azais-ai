"use client";

import HeroSection from "@/components/ui/hero-section";
import IntegrationHero from "@/components/ui/integration-hero";
import { VideoSpotlight } from "@/components/marketing/video-spotlight";
import { VideoCorridorShowcase } from "@/components/marketing/video-corridor-showcase";
import { FeatureGridSection } from "@/components/marketing/feature-grid-section";
import { FaqSection } from "@/components/marketing/faq-section";
import TestimonialsSectionV2 from "@/components/ui/testimonial-v2";
import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Pricing } from "@/components/blocks/pricing";
import { useLanguage } from "@/lib/i18n/context";
import { usePricingPlans } from "@/hooks/use-pricing-plans";

export default function LandingPage() {
  const { t } = useLanguage();
  const plans = usePricingPlans();

  return (
    <main className="bg-bg">
      <HeroSection />

      <VideoSpotlight />

      <VideoCorridorShowcase />

      <FeatureGridSection />

      <IntegrationHero />
      <TestimonialsSectionV2 />
      <Pricing id="pricing" plans={plans} title={t.pricing.plansTitle} description={t.pricing.plansDesc} />
      <FaqSection />
      <CTAWithVerticalMarquee />

      <CinematicFooter />
    </main>
  );
}
