"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileNav } from "@/components/ui/navbar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { InteractiveHoverButton, LogoutButton } from "@/components/ui/interactive-hover-button";
import { clearSession, fetchProfile, getSession, saveSession, SESSION_EVENT } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);
  const [credits, setCredits] = useState(0);

  const AUTHENTICATED_NAV = [
    {
      name: t.nav.create,
      items: [
        { href: "/", label: t.nav.home },
        { href: "/studio/video", label: t.nav.video },
        { href: "/studio/image", label: t.nav.image },
        { href: "/history", label: t.nav.history },
        { href: "/#pricing", label: t.nav.pricing },
      ],
    },
  ];

  const GUEST_NAV = [
    {
      name: t.nav.create,
      items: [
        { href: "/", label: t.nav.home },
        { href: "/#features", label: t.nav.features },
        { href: "/#pricing", label: t.nav.pricing },
        { href: "/#faq", label: t.nav.faq },
      ],
    },
  ];

  const syncSession = useCallback(() => {
    const session = getSession();
    setSignedIn(Boolean(session));
    setCredits(session?.user.creditBalance ?? 0);
  }, []);

  function handleLogout() {
    clearSession();
    toast.success(t.toast.loggedOut);
    router.push("/");
  }

  const inStudio = pathname.startsWith("/studio");
  const NAVIGATION = signedIn ? AUTHENTICATED_NAV : GUEST_NAV;

  useEffect(() => {
    syncSession();
    const session = getSession();
    if (session) {
      fetchProfile(session.accessToken)
        .then((user) => saveSession({ ...session, user }))
        .catch(() => undefined);
    }
  }, [pathname, syncSession]);

  useEffect(() => {
    window.addEventListener(SESSION_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(SESSION_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [syncSession]);

  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-background/95 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-3">
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" aria-label="AzaisAi home" className="group inline-flex items-center gap-3 text-foreground">
            <svg
              viewBox="0 0 40 40"
              role="img"
              aria-hidden="true"
              className="size-10 shrink-0 overflow-visible drop-shadow-[0_8px_16px_rgba(37,99,235,0.18)] transition-transform duration-300 group-hover:scale-[1.04]"
            >
              <defs>
                <linearGradient id="azais-mark" x1="7" y1="4" x2="33" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#azais-mark)" />
              <path
                d="m10.8 28.2 7.45-16.1c.7-1.52 2.8-1.52 3.5 0l7.45 16.1"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M15.2 23h9.6" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <circle cx="30.5" cy="9.5" r="2.2" fill="#BFDBFE" />
            </svg>
            <span className="text-base font-semibold tracking-[-0.04em]">
              Azais<span className="text-primary">Ai</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Main navigation">
          {NAVIGATION[0].items.filter((item) => item.href !== "/history").map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center justify-end gap-2 lg:ml-0">
          {signedIn && (
            <div className="hidden items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground xl:flex">
              <Zap className="size-3.5 text-primary" />
              <span className="tabular-nums text-foreground">{credits}</span>
              <span>{t.nav.credits}</span>
            </div>
          )}
          {signedIn ? (
            <>
              {!inStudio && (
                <div className="hidden md:inline-flex">
                  <InteractiveHoverButton href="/studio/image" text={t.nav.openStudio} size="sm" />
                </div>
              )}
              {/* Studio pages carry their own logout button in the sidebar. */}
              {!inStudio && <LogoutButton onClick={handleLogout} text={t.nav.logOut} size="sm" />}
            </>
          ) : (
            <>
              <div className="hidden md:inline-flex">
                <InteractiveHoverButton href="/login" text={t.nav.signIn} size="sm" />
              </div>
              <div className="hidden md:inline-flex">
                <InteractiveHoverButton href="/signup?next=/studio/image" text={t.nav.getStarted} size="sm" />
              </div>
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileNav
            nav={
              signedIn
                ? NAVIGATION
                : [
                    ...NAVIGATION,
                    {
                      name: t.nav.account,
                      items: [
                        { href: "/login", label: t.nav.signIn },
                        { href: "/signup?next=/studio/image", label: t.nav.startFree },
                      ],
                    },
                  ]
            }
          />
        </div>
      </div>
    </header>
  );
}
