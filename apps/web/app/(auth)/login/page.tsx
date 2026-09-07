"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AuthInput } from "@/components/marketing/auth-input";
import { GoogleButton } from "@/components/marketing/google-button";
import { Button } from "@/components/ui/button";
import { apiLogin, saveSession } from "@/lib/auth-client";
import { fadeUp } from "@/lib/motion";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const session = await apiLogin(email, password);
      saveSession(session);
      router.push(searchParams.get("next") ?? "/pricing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-medium text-text">Welcome back</h1>
      <p className="mt-2 text-sm text-text-faint">Sign in to keep generating.</p>

      <div className="mt-8">
        <GoogleButton label="Continue with Google" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border-soft" />
        <span className="text-xs font-medium uppercase tracking-widest text-text-faint">or</span>
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput label="Email" type="email" name="email" placeholder="you@studio.com" required />
        <AuthInput label="Password" type="password" name="password" placeholder="••••••••" required />

        <div className="flex justify-end">
          <Link href="/login" className="text-xs font-medium text-text-faint hover:text-accent-hi">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="mt-1 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight size={15} />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-faint">
        New to AzaisAi?{" "}
        <Link href="/signup" className="font-medium text-accent-hi hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
