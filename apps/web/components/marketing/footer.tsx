"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useLanguage();

  const columns = [
    {
      title: t.footer.product,
      links: [
        { href: "/studio/video", label: t.footer.linkVideo },
        { href: "/studio/image", label: t.footer.linkImage },
        { href: "/#pricing", label: t.footer.linkPricing },
        { href: "/history", label: t.footer.linkHistory },
      ],
    },
  ];

  return (
    <footer className="border-t border-border-soft bg-bg">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                A
              </span>
              <span className="text-base font-semibold tracking-tight text-text">
                AzaisAi
              </span>
            </div>
            <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-text-faint">{t.footer.tagline}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-faint">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-accent-hi"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border-soft pt-6 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} AzaisAi. {t.footer.rights}
          </span>
          <span>{t.footer.subtitle}</span>
        </div>
      </div>
    </footer>
  );
}
