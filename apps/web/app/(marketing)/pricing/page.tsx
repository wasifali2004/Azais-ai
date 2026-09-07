"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Sparkle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pricing } from "@/components/ui/pricing";
import { Footer } from "@/components/marketing/footer";
import { fetchBillingConfig } from "@/lib/auth-client";
import { PRICING_PLANS } from "@/lib/pricing";
import { fadeUp } from "@/lib/motion";

const PLAN_COPY: Record<string, { buttonText: string; description: string }> = {
  starter: {
    buttonText: "Choose Starter",
    description: "Perfect for individuals just getting started with AI generation.",
  },
  pro: {
    buttonText: "Get Started",
    description: "Ideal for creators who need every model, priority queue and clean exports.",
  },
  business: {
    buttonText: "Choose Business",
    description: "For teams shipping high volumes of finished video and image work.",
  },
};

const PRICING_SECTION_PLANS = PRICING_PLANS.map((plan) => ({
  name: plan.name.toUpperCase(),
  price: String(Math.round(plan.price)),
  yearlyPrice: String(Math.round(plan.price * 0.8)),
  period: "per month",
  features: plan.features,
  description: PLAN_COPY[plan.id]?.description ?? "",
  buttonText: PLAN_COPY[plan.id]?.buttonText ?? "Choose plan",
  href: `/checkout/${plan.id}`,
  isPopular: !!plan.popular,
}));

export default function PricingPage() {
  const [devSkipPayment, setDevSkipPayment] = useState(false);

  useEffect(() => {
    fetchBillingConfig()
      .then((config) => setDevSkipPayment(config.devSkipPayment))
      .catch(() => setDevSkipPayment(false));
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {devSkipPayment && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-medium text-amber-600">
            <AlertTriangle size={16} className="shrink-0" />
            Test mode: payments are simulated. Subscribing here will not charge a card — it grants
            the plan instantly for demo purposes.
          </div>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5 rounded-2xl border border-border-soft bg-surface p-7 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent-hi">
              <Sparkle size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-text">Start your free trial</h2>
              <p className="mt-1 max-w-md text-sm text-text-faint">
                Verify your phone to get 8 free credits — no card required. One trial per phone number.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Check size={14} className="text-accent-hi" /> Sora 2 video generation
                </span>
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Check size={14} className="text-accent-hi" /> Nano Banana image generation
                </span>
                <span className="flex items-center gap-1.5 text-text-faint">
                  <X size={14} className="text-text-faint" /> Premium models
                </span>
                <span className="flex items-center gap-1.5 text-text-faint">
                  <X size={14} className="text-text-faint" /> Clean downloads
                </span>
              </div>
            </div>
          </div>
          <Button variant="primary" size="lg" className="shrink-0">
            Start free trial
          </Button>
        </motion.div>
      </div>

      <div className="bg-background text-foreground">
        <Pricing
          plans={PRICING_SECTION_PLANS}
          title="Simple, Transparent Pricing"
          description={"Choose the plan that works for you\nCancel anytime. No hidden fees, no watermarks on paid plans."}
        />
      </div>

      <Footer />
    </>
  );
}
