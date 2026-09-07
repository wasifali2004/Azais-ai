"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createCheckout, getSession, type SubscribableTier } from "@/lib/auth-client";

export default function CheckoutRedirectPage() {
  const params = useParams<{ tier: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tier = params.tier;
    if (!getSession()) {
      router.replace(`/login?next=${encodeURIComponent(`/checkout/${tier}`)}`);
      return;
    }

    createCheckout(tier.toUpperCase() as SubscribableTier)
      .then((url) => {
        window.location.href = url;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not start checkout");
      });
  }, [params.tier, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <p className="text-sm text-muted-foreground">{error ?? "Redirecting to checkout…"}</p>
    </div>
  );
}
