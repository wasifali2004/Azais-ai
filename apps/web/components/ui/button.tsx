import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-accent-hi to-accent text-[#160c04] font-semibold shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_24px_-10px_var(--accent)] hover:brightness-[1.06] active:brightness-95",
  secondary:
    "bg-surface-2 text-text border border-border-soft hover:border-accent/40 hover:text-accent-hi",
  outline:
    "bg-transparent text-text border border-border hover:border-accent/50 hover:text-accent-hi",
  ghost: "bg-transparent text-text-muted hover:text-text",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 rounded-lg",
  md: "text-sm px-5 py-3 rounded-xl",
  lg: "text-base px-7 py-4 rounded-xl",
};

const base =
  "inline-flex items-center justify-center gap-2 transition-all duration-200 ease-out active:translate-y-px disabled:opacity-50 disabled:pointer-events-none select-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} target={props.target} rel={props.rel} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, ...rest } = props;
  void _variant;
  void _size;
  void _className;
  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
