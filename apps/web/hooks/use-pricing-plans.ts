"use client";

import type { PricingPlan } from "@/components/blocks/pricing";
import { useLanguage } from "@/lib/i18n/context";
import { PRICING_PLANS } from "@/lib/pricing";

/** Maps the raw plan data + the active language's plan copy into what <Pricing> renders. */
export function usePricingPlans(): PricingPlan[] {
  const { t } = useLanguage();

  return PRICING_PLANS.map((plan) => ({
    name: plan.name,
    price: plan.price,
    period: "month",
    features: plan.features,
    description: t.pricing.plans[plan.id as keyof typeof t.pricing.plans].description,
    buttonText: t.pricing.plans[plan.id as keyof typeof t.pricing.plans].buttonText,
    href: `/checkout/${plan.id}`,
    isPopular: Boolean(plan.popular),
  }));
}
