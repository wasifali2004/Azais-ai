"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Crown, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { createCheckout, getSession, type SubscribableTier } from "@/lib/auth-client";
import type { PricingPlan } from "@/lib/pricing";

const ICONS: Record<string, typeof Shield> = { starter: Shield, pro: Crown, business: Zap };

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const Icon = ICONS[plan.id] ?? Shield;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleChoose() {
    if (!getSession()) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const url = await createCheckout(plan.id.toUpperCase() as SubscribableTier);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "relative flex flex-col rounded-2xl border p-7",
        plan.popular
          ? "border-accent/60 bg-surface shadow-[0_0_0_1px_var(--accent)_inset,0_24px_60px_-24px_var(--accent)]"
          : "border-border-soft bg-surface",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-hi to-accent px-3.5 py-1 text-xs font-bold text-[#160c04]">
          Most popular
        </span>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={plan.popular ? "text-accent-hi" : "text-text-faint"} />
          <span className="text-sm font-semibold text-text">{plan.name}</span>
        </div>
        <span className="text-xs font-medium text-text-faint">{plan.tagline}</span>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-medium text-text">${plan.price.toFixed(2)}</span>
        <span className="text-sm text-text-faint">/month</span>
      </div>
      <p className="mt-1 text-sm text-text-faint">{plan.credits} credits / month</p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-text-muted">
            <Check size={15} className="mt-0.5 shrink-0 text-accent-hi" />
            {feature}
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <Button
        variant={plan.popular ? "primary" : "secondary"}
        size="lg"
        className="mt-7 w-full"
        disabled={loading}
        onClick={handleChoose}
      >
        {loading ? "Redirecting…" : `Choose ${plan.name}`}
      </Button>
    </motion.div>
  );
}
