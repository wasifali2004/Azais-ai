"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchProfile, getSession, saveSession } from "@/lib/auth-client";

function SuccessInner() {
  const searchParams = useSearchParams();
  const isDevBypass = searchParams.get("dev") === "1";
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("error");
      return;
    }
    fetchProfile(session.accessToken)
      .then((user) => {
        saveSession({ ...session, user });
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, []);

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
          Could not confirm your subscription. If you were charged, check your account balance or
          contact support.
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
