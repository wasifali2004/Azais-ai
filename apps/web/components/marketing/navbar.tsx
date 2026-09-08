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
import { PricingModal } from "@/components/marketing/pricing-modal";
import { clearSession, fetchProfile, getSession, saveSession, SESSION_EVENT } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";
import { usePricingPlans } from "@/hooks/use-pricing-plans";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);
  const [credits, setCredits] = useState(0);
  const [pricingOpen, setPricingOpen] = useState(false);
  const plans = usePricingPlans();

  const inStudio = pathname.startsWith("/studio");
  // In studio, opening the pricing link would navigate away mid-session — show it as a
  // popup instead. Elsewhere it's a real link to the homepage's pricing section.
  const pricingItem = inStudio
    ? { href: "/#pricing", label: t.nav.pricing, onClick: () => setPricingOpen(true) }
    : { href: "/#pricing", label: t.nav.pricing };

  const AUTHENTICATED_NAV = [
    {
      name: t.nav.create,
      items: [
        { href: "/", label: t.nav.home },
        { href: "/studio/video", label: t.nav.video },
        { href: "/studio/image", label: t.nav.image },
        { href: "/history", label: t.nav.history },
        pricingItem,
      ],
    },
  ];

  const GUEST_NAV = [
    {
      name: t.nav.create,
      items: [
        { href: "/", label: t.nav.home },
        { href: "/#features", label: t.nav.features },
        pricingItem,
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
    <>
    <header className="sticky top-0 z-50 h-20 w-full bg-background/95 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-3">
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" aria-label="AzaisAi home" className="group inline-flex items-center text-foreground">
            <span className="logo-shine animate-text-shine text-lg font-semibold tracking-tight">AzaisAi</span>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Main navigation">
          {NAVIGATION[0].items.filter((item) => item.href !== "/history").map((item) => {
            if (item.onClick) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={item.onClick}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </button>
              );
            }
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
    <PricingModal
      open={pricingOpen}
      onClose={() => setPricingOpen(false)}
      plans={plans}
      title={t.pricing.plansTitle}
      description={t.pricing.plansDesc}
    />
    </>
  );
}
