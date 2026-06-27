import Link from "next/link";

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
    <footer className="mt-10 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-lg font-extrabold text-zinc-900">
            Mobile<span className="text-red-600">Arena</span>.com
          </span>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
            {PRIMARY.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-red-600">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
          <span>© 2000-2026 MobileArena.com</span>
          {META.map((m) => (
            <span key={m} className="flex items-center gap-3">
              <span className="text-zinc-300">·</span>
              <Link href="#" className="hover:text-red-600">
                {m}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
