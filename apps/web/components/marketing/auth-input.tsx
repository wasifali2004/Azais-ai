"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AuthInput({
  label,
  type = "text",
  ...rest
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-faint">
        {label}
      </span>
      <div className="relative">
        <input
          type={isPassword ? (reveal ? "text" : "password") : type}
          className="w-full rounded-xl border border-border-soft bg-surface px-3.5 py-3 text-sm text-text placeholder:text-text-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </label>
  );
}
