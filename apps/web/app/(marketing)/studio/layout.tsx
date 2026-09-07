"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/studio/image", label: "Image" },
  { href: "/studio/video", label: "Video" },
];

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mx-auto flex max-w-7xl items-center justify-center px-5 pt-6 sm:px-8">
        <div className="flex gap-1.5 rounded-xl bg-surface-2 p-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium transition-all",
                pathname === tab.href
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-faint hover:text-text-muted",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
