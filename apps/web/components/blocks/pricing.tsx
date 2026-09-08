"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  id?: string;
  /** Trims the section's own page-level padding for use inside a modal/panel instead of on a page. */
  compact?: boolean;
}

export function Pricing({
  plans,
  title = "Simple, transparent pricing",
  description = "Pick the plan that matches how much you create. Every plan includes access to all models.",
  id,
  compact = false,
}: PricingProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 bg-bg", compact ? "py-8 sm:py-10" : "py-20 sm:py-28")}>
      <div className={cn("mx-auto max-w-7xl px-5 sm:px-8", compact && "px-4 sm:px-6")}>
        <div className={cn("mx-auto max-w-2xl space-y-3 text-center", compact ? "mb-8" : "mb-14 space-y-4")}>
          <h2 className={cn("font-semibold tracking-[-0.035em] text-text", compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl")}>
            {title}
          </h2>
          <p className={cn("text-text-muted", compact ? "text-sm leading-6" : "text-base leading-7")}>{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface p-8 text-center",
                plan.isPopular ? "border-accent border-2 shadow-lg shadow-accent/10 lg:-translate-y-3" : "border-border-soft",
              )}
            >
              {plan.isPopular && (
                <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-accent px-3 py-1">
                  <Star size={13} className="fill-current text-white" />
                  <span className="text-xs font-semibold text-white">Popular</span>
                </div>
              )}

              <p className="text-sm font-semibold text-text-muted">{plan.name}</p>

              <div className="mt-6 flex items-center justify-center gap-x-1.5">
                <span className="text-5xl font-bold tracking-tight text-text">
                  <NumberFlow
                    value={plan.price}
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: Number.isInteger(plan.price) ? 0 : 2,
                      maximumFractionDigits: 2,
                    }}
                    transformTiming={{ duration: 500, easing: "ease-out" }}
                    willChange
                    className="tabular-nums"
                  />
                </span>
                <span className="text-sm font-semibold leading-6 text-text-faint">/ {plan.period}</span>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-left">
                    <Check size={15} className="mt-0.5 shrink-0 text-accent-hi" />
                    <span className="text-sm text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-1 flex-col justify-end">
                <InteractiveHoverButton href={plan.href} text={plan.buttonText} size="lg" fullWidth />
                <p className="mt-4 text-xs leading-5 text-text-faint">{plan.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
