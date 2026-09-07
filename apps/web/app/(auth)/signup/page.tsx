"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "lucide-react";
import { AuthInput } from "@/components/marketing/auth-input";
import { GoogleButton } from "@/components/marketing/google-button";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-medium text-text">Create your account</h1>
      <p className="mt-2 text-sm text-text-faint">8 free credits on signup — no card required.</p>

      <div className="mt-8">
        <GoogleButton label="Sign up with Google" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border-soft" />
        <span className="text-xs font-medium uppercase tracking-widest text-text-faint">or</span>
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput label="Full name" type="text" name="name" placeholder="Ada Lovelace" required />
        <AuthInput label="Email" type="email" name="email" placeholder="you@studio.com" required />
        <AuthInput label="Password" type="password" name="password" placeholder="At least 8 characters" required />

        <Button type="submit" variant="primary" size="lg" className="mt-1 w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRight size={15} />}
        </Button>
      </form>

      <div className="mt-5 flex items-center gap-2 rounded-lg bg-accent-wash px-3.5 py-2.5 text-xs text-accent-hi">
        <Sparkle size={13} />
        Includes Sora 2 video + Nano Banana image generation on the free tier.
      </div>

      <p className="mt-6 text-center text-sm text-text-faint">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-hi hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
