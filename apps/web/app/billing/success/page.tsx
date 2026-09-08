"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmCheckout, fetchProfile, getSession, saveSession } from "@/lib/auth-client";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The checkout may not be in its terminal "succeeded" state the instant the
 * browser lands back here, so give it a few short retries before treating it
 * as a real failure.
 */
async function confirmCheckoutWithRetry(checkoutId: string, attempts = 4, delayMs = 1500) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await confirmCheckout(checkoutId);
    } catch (err) {
      if (attempt === attempts) throw err;
      await sleep(delayMs);
    }
  }
  throw new Error("Could not confirm your checkout");
}

function SuccessInner() {
  const searchParams = useSearchParams();
  const isDevBypass = searchParams.get("dev") === "1";
  const checkoutId = searchParams.get("checkout_id");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("error");
      return;
    }

    // Real checkouts (not the dev bypass) carry the id Polar put on the
    // return URL — verify it directly against Polar's API and grant the
    // plan here, instead of waiting on a webhook.
    const confirmed =
      isDevBypass || !checkoutId ? Promise.resolve() : confirmCheckoutWithRetry(checkoutId).then(() => undefined);

    confirmed
      .then(() => fetchProfile(session.accessToken))
      .then((user) => {
        saveSession({ ...session, user });
        setStatus("done");
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : null);
        setStatus("error");
      });
  }, [isDevBypass, checkoutId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      {isDevBypass && (
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
          Test mode: payment simulated, no real charge
        </span>
      )}

      {status === "loading" && <p className="text-sm text-text-faint">Finishing up…</p>}

      {status === "done" && (
        <>
          <h1 className="font-display text-2xl font-medium text-text">You&apos;re all set</h1>
          <p className="max-w-sm text-sm text-text-muted">
            {isDevBypass
              ? "Your plan and credits were updated instantly — this was a dev bypass, no real payment was processed."
              : "Your subscription is active and your credits have been updated."}
          </p>
        </>
      )}

      {status === "error" && (
        <p className="max-w-sm text-sm text-text-muted">
          {errorMessage ??
            "Could not confirm your subscription. If you were charged, check your account balance or contact support."}
        </p>
      )}

      <Link href="/studio/video" className="text-sm font-medium text-accent-hi hover:underline">
        Start generating →
      </Link>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
