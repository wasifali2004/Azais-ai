"use client";

import { Sparkles } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useLanguage } from "@/lib/i18n/context";

export function GenerateBar({
  cost,
  loading,
  label,
  onGenerate,
  disabledReason,
  actionHref,
}: {
  cost: number;
  loading: boolean;
  label: string;
  onGenerate: () => void;
  disabledReason?: string | null;
  actionHref?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 border-t border-border-soft bg-surface pt-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-faint">{t.studio.estimatedCost}</span>
        <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 font-semibold text-text">
          <Sparkles size={12} className="text-accent" />
          {cost} {cost === 1 ? t.studio.credit : t.studio.credits}
        </span>
      </div>

      {actionHref ? (
        <InteractiveHoverButton href={actionHref} text={t.studio.signInToGenerate} size="lg" fullWidth />
      ) : (
        <InteractiveHoverButton
          type="button"
          text={label}
          size="lg"
          fullWidth
          loading={loading}
          disabled={!!disabledReason}
          onClick={onGenerate}
          title={disabledReason ?? undefined}
        />
      )}

      {!loading && disabledReason && !actionHref && (
        <p className="text-center text-xs text-text-faint">{disabledReason}</p>
      )}
    </div>
  );
}
