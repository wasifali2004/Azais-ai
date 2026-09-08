"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type MobileNavGroup = {
  name: string;
  items: { label: string; href: string; onClick?: () => void }[];
};

export function MobileNav({ nav }: { nav: MobileNavGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-9 touch-manipulation items-center justify-center rounded-lg border border-border-soft bg-surface text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative size-4" aria-hidden="true">
          <span className={cn("absolute left-0 block h-0.5 w-4 rounded-full bg-foreground transition-all duration-200", open ? "top-[0.45rem] -rotate-45" : "top-1")} />
          <span className={cn("absolute left-0 block h-0.5 w-4 rounded-full bg-foreground transition-all duration-200", open ? "top-[0.45rem] rotate-45" : "top-2.5")} />
        </span>
      </button>

      {open && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full max-h-[calc(100svh-5rem)] overflow-y-auto bg-background/95 px-6 py-6 shadow-xl shadow-black/10 backdrop-blur-xl dark:shadow-black/30">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            {nav.map((category) => (
              <div className="flex flex-col gap-4" key={category.name}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{category.name}</p>
                <div className="flex flex-col gap-1">
                  {category.items.map((item) =>
                    item.onClick ? (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          item.onClick?.();
                        }}
                        className="rounded-lg px-3 py-2.5 text-left text-xl font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-xl font-medium transition-colors hover:bg-secondary",
                          pathname === item.href || pathname.startsWith(`${item.href}/`) ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
