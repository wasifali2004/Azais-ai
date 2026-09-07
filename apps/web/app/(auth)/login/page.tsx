"use client";

import { useRouter } from "next/navigation";
import Component from "@/components/ui/modern-login-signup";

export default function LoginPage() {
  const router = useRouter();

  return (
    <Component
      initialMode="login"
      onToggleMode={(mode) => {
        if (mode === "signup") router.push("/signup");
      }}
    />
  );
}
