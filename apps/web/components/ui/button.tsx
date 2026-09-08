import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shadcn-shaped variants for drop-in components (e.g. Pricing) that import
 * `buttonVariants` directly rather than the `Button` component below. Kept
 * separate from our own `Button` API so neither has to bend to fit the other.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white font-semibold shadow-sm shadow-accent/15 hover:bg-accent-hi active:bg-accent",
  secondary: "bg-surface-2 text-text border border-border-soft hover:border-text/40",
  outline: "bg-surface text-text border border-border hover:border-accent/45 hover:text-accent-hi",
  ghost: "bg-transparent text-text-muted hover:bg-surface-2 hover:text-text",
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
