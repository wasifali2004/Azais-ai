"use client";

import { useRouter } from "next/navigation";
import Component from "@/components/ui/modern-login-signup";

export default function SignupPage() {
  const router = useRouter();

  return (
    <Component
      initialMode="signup"
      onToggleMode={(mode) => {
        if (mode === "login") router.push("/login");
      }}
    />
  );
}
