"use client";

import HeroSection from "@/components/ui/hero-section";
import { GenerationGallery } from "@/components/marketing/generation-gallery";
import { VideoCorridorShowcase } from "@/components/marketing/video-corridor-showcase";
import { FeatureGridSection } from "@/components/marketing/feature-grid-section";
import { FaqSection } from "@/components/marketing/faq-section";
import TestimonialsSectionV2 from "@/components/ui/testimonial-v2";
import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Pricing, type PricingPlan } from "@/components/blocks/pricing";
import { useLanguage } from "@/lib/i18n/context";
import { PRICING_PLANS } from "@/lib/pricing";

export default function LandingPage() {
  const { t } = useLanguage();

  const plans: PricingPlan[] = PRICING_PLANS.map((plan) => ({
    name: plan.name,
    price: plan.price,
    period: "month",
    features: plan.features,
    description: t.pricing.plans[plan.id as keyof typeof t.pricing.plans].description,
    buttonText: t.pricing.plans[plan.id as keyof typeof t.pricing.plans].buttonText,
    href: `/checkout/${plan.id}`,
    isPopular: Boolean(plan.popular),
  }));

  return (
    <main className="bg-bg">
      <HeroSection />

      <VideoCorridorShowcase />

      <FeatureGridSection />

      <GenerationGallery />
      <TestimonialsSectionV2 />
      <Pricing id="pricing" plans={plans} title={t.pricing.plansTitle} description={t.pricing.plansDesc} />
      <FaqSection />
      <CTAWithVerticalMarquee />

      <CinematicFooter />
    </main>
  );
}
