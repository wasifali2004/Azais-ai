"use client";

import NumberFlow from "@number-flow/react";
import Link from "next/link";
import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

export function Pricing({
  plans,
  title = "Simple, transparent pricing",
  description = "Pick the credit allowance that matches your workflow. Upgrade or cancel anytime.",
}: {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}) {
  const [annual, setAnnual] = React.useState(false);

  return (
    <section className="bg-bg pb-24 pt-12 sm:pb-28 sm:pt-16" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Subscription plans</p>
          <h1 id="pricing-heading" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-text-muted">{description}</p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={cn("text-sm font-medium", !annual ? "text-text" : "text-text-faint")}>Monthly</span>
          <Switch aria-label="Use annual billing" checked={annual} onCheckedChange={setAnnual} />
          <span className={cn("text-sm font-medium", annual ? "text-text" : "text-text-faint")}>Annual</span>
          <span className="rounded-full bg-accent-wash px-2.5 py-1 text-[11px] font-bold text-accent-hi">Save 20%</span>
        </div>

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const monthlyPrice = Number(annual ? plan.yearlyPrice : plan.price);
            return (
              <article
                key={plan.name}
                className={cn(
                  "relative flex min-h-[520px] flex-col rounded-2xl border bg-surface p-7 shadow-sm",
                  plan.isPopular ? "border-accent shadow-lg shadow-accent/10" : "border-border",
                )}
              >
                {plan.isPopular && (
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Sparkles size={11} /> Most popular
                  </span>
                )}

                <div>
                  <p className="text-sm font-semibold text-text">{plan.name}</p>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-text-muted">{plan.description}</p>
                </div>

                <div className="mt-7 flex items-end gap-2 border-b border-border-soft pb-7">
                  <span className="text-4xl font-semibold tracking-[-0.04em] text-text">
                    <NumberFlow
                      value={monthlyPrice}
                      format={{
                        style: "currency",
                        currency: "USD",
                        currencyDisplay: "narrowSymbol",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                    />
                  </span>
                  <span className="pb-1 text-sm text-text-faint">/ {plan.period}</span>
                </div>

                <ul className="mt-7 flex flex-1 flex-col gap-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-text-muted">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent-hi">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {annual && (
                  <p className="mb-3 text-center text-xs text-text-faint">
                    Billed ${(monthlyPrice * 12).toFixed(2)} yearly
                  </p>
                )}
                <Link
                  href={plan.href}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-colors",
                    plan.isPopular
                      ? "border-accent bg-accent text-white hover:bg-accent-hi"
                      : "border-border bg-bg text-text hover:border-accent/50 hover:text-accent-hi",
                  )}
                >
                  {plan.buttonText}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
