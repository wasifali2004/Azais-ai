"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchProfile, saveSession } from "@/lib/auth-client";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing sign-in token. Please try again.");
      return;
    }

    fetchProfile(token)
      .then((user) => {
        saveSession({ accessToken: token, user });
        router.replace("/pricing");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not complete sign-in");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      {error ? (
        <>
          <p className="text-sm text-text-muted">{error}</p>
          <Link href="/login" className="text-sm font-medium text-accent-hi hover:underline">
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-pulse rounded-full bg-accent"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-text-faint">Signing you in…</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
