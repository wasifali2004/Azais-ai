import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  accent: "bg-accent-wash text-accent-hi",
  muted: "bg-surface-2 text-text-muted border border-border-soft",
  solid: "bg-text text-bg",
};

export function Badge({
  children,
  tone = "accent",
  className,
}: {
  children: string;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
