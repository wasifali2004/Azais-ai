"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Clapperboard, Image as ImageIcon, History, Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/studio/video", label: "Video", icon: Clapperboard },
  { href: "/studio/image", label: "Image", icon: ImageIcon },
  { href: "/history", label: "History", icon: History },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent-hi to-accent-lo font-display text-sm font-semibold text-[#160c04]">
              A
            </span>
            <span className="font-display text-lg font-medium tracking-tight text-text">
              AzaisAi
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "text-text" : "text-text-muted hover:text-text",
                  )}
                >
                  <link.icon size={15} className={active ? "text-accent-hi" : ""} />
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-surface-2"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href="/pricing"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                pathname === "/pricing" ? "text-text" : "text-text-muted hover:text-text",
              )}
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted sm:flex">
            <Zap size={13} className="text-accent-hi" />
            <span className="tabular-nums text-text">0</span>
            <span>credits</span>
          </div>
          <ThemeToggle />
          <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button href="/signup" variant="primary" size="sm" className="hidden sm:inline-flex">
            Start free
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-text-muted md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border-soft px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {[...NAV_LINKS, { href: "/pricing", label: "Pricing", icon: Zap }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button href="/login" variant="secondary" size="sm" className="flex-1">
                Sign in
              </Button>
              <Button href="/signup" variant="primary" size="sm" className="flex-1">
                Start free
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
