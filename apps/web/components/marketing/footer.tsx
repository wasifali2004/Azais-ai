import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/studio/video", label: "Video generation" },
      { href: "/studio/image", label: "Image generation" },
      { href: "/pricing", label: "Pricing" },
      { href: "/history", label: "History" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "About" },
      { href: "/", label: "Careers" },
      { href: "/", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/", label: "Terms" },
      { href: "/", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-text font-display text-sm font-semibold text-bg">
                A
              </span>
              <span className="font-display text-lg font-medium tracking-tight text-text">
                AzaisAi
              </span>
            </div>
            <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-text-faint">
              Cinematic video and image generation, built for people who finish what they start.
            </p>
          </div>
          {COLUMNS.map((col) => (
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
          <span>© {new Date().getFullYear()} AzaisAi. All rights reserved.</span>
          <span>Made for creators who ship.</span>
        </div>
      </div>
    </footer>
  );
}
