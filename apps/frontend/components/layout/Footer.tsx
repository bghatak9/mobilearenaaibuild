import Link from "next/link";
import { Container, TitanLogo } from "@mobilearena/ui";

const PRIMARY = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Reviews", href: "/reviews" },
  { label: "Compare", href: "/compare" },
  { label: "Coverage", href: "/coverage" },
  { label: "Glossary", href: "/glossary" },
  { label: "FAQ", href: "/faq" },
  { label: "RSS", href: "/rss" },
  { label: "Youtube", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "Twitter", href: "#" },
];

const META = [
  "Mobile version",
  "Android app",
  "Tools",
  "Contact us",
  "Merch store",
  "Privacy",
  "Terms of use",
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-border-soft bg-surface-1">
      <Container className="py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 titan-display text-lg">
            <TitanLogo className="h-7 w-7" />
            Mobile<span className="text-blue">Arena</span>.com
          </Link>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
            {PRIMARY.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="hover:text-blue transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span>© 2000-2026 MobileArena.com</span>
          {META.map((m) => (
            <span key={m} className="flex items-center gap-3">
              <span className="text-border-strong">·</span>
              <Link href="#" className="hover:text-blue transition">
                {m}
              </Link>
            </span>
          ))}
        </div>
      </Container>
    </footer>
  );
}
