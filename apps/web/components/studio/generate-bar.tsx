"use client";

import { Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateBar({
  cost,
  loading,
  label,
  onGenerate,
}: {
  cost: number;
  loading: boolean;
  label: string;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-3 border-t border-border-soft pt-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-faint">Estimated cost</span>
        <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 font-semibold text-text">
          <Sparkle size={12} className="text-accent-hi" />
          {cost} credits
        </span>
      </div>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={onGenerate}
      >
        {loading ? "Generating…" : label}
      </Button>
    </div>
  );
}
