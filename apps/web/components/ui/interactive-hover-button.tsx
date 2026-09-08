import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LogOut, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

/**
 * Fixed height + padding per size so the pill never depends on its caller's
 * ad hoc `py-*`/`text-*` overrides — width still tracks the label's content
 * unless `fullWidth` is set.
 */
const sizeClasses: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-4 text-xs",
  md: "h-11 gap-2 px-6 text-sm",
  lg: "h-13 gap-2 px-7 text-base",
};

const iconSize: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

const shell =
  // Fill is the theme's own text/bg pair, inverted on hover — monochrome in
  // both themes, no accent color involved.
  "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-border bg-background text-center font-semibold text-text transition-colors disabled:cursor-not-allowed disabled:opacity-70";

function ButtonInner({
  text,
  icon: Icon = ArrowRight,
  size,
  loading,
}: {
  text: string;
  icon?: LucideIcon;
  size: Size;
  loading?: boolean;
}) {
  // Invisible but in normal flow, so the shell (`w-fit`) sizes itself to fit
  // the widest state (label + icon) instead of just the plain label — the
  // real content below is all `absolute`, which contributes no width.
  const sizer = (
    <span aria-hidden="true" className="invisible flex items-center gap-2">
      <span>{text}</span>
      <Icon size={iconSize[size]} />
    </span>
  );

  if (loading) {
    return (
      <>
        {sizer}
        <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-bg opacity-100">
          <span>{text}</span>
          <Loader2 size={iconSize[size]} className="animate-spin" />
        </span>
        <span className="absolute inset-0 bg-text" />
      </>
    );
  }

  return (
    <>
      {sizer}
      <span className="absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 group-hover:-translate-x-2 group-hover:opacity-0">
        {text}
      </span>
      <span className="absolute inset-0 z-10 flex translate-x-2 items-center justify-center gap-2 text-bg opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{text}</span>
        <Icon size={iconSize[size]} />
      </span>
      <span className="absolute left-[20%] top-[40%] h-2 w-2 scale-0 rounded-lg bg-text opacity-0 transition-all duration-300 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:opacity-100" />
    </>
  );
}

type CommonProps = {
  text?: string;
  icon?: LucideIcon;
  size?: Size;
  /** Stretches to the width of its container instead of the label's intrinsic width. */
  fullWidth?: boolean;
  /** Shows a spinner and freezes the shell in its filled state, e.g. while a form submits. */
  loading?: boolean;
  className?: string;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

/**
 * Pill button that fills with the theme's text color on hover and swaps its
 * label for an icon-trailing copy of itself in the background color — a
 * monochrome invert, not a brand-color fill, so it reads the same in light
 * and dark. Renders a `<button>` by default, or a `next/link` when `href` is
 * passed — both share the same hover shell so the animation is identical.
 */
export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonAsButton | ButtonAsLink
>((props, ref) => {
  const { text = "Button", icon, size = "md", fullWidth, loading, className } = props;
  const classes = cn(shell, sizeClasses[size], fullWidth ? "w-full" : "w-fit", className);

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} target={target} rel={rel} className={classes}>
        <ButtonInner text={text} icon={icon} size={size} loading={loading} />
      </Link>
    );
  }

  const {
    text: _text,
    icon: _icon,
    size: _size,
    fullWidth: _fullWidth,
    loading: _loading,
    className: _className,
    href: _href,
    ...rest
  } = props as ButtonAsButton;
  void _text;
  void _icon;
  void _size;
  void _fullWidth;
  void _loading;
  void _className;
  void _href;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={loading || rest.disabled}
      className={cn(classes, "cursor-pointer")}
      {...rest}
    >
      <ButtonInner text={text} icon={icon} size={size} loading={loading} />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

/** InteractiveHoverButton preset for signing a user out — same animation, log-out icon. */
export function LogoutButton(props: Omit<ButtonAsButton, "icon"> & { text?: string }) {
  return <InteractiveHoverButton text={props.text ?? "Log out"} {...props} icon={LogOut} />;
}
