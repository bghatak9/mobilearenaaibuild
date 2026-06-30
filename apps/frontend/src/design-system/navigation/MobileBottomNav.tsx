"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Smartphone, Swords, User, Users } from "lucide-react";

import { useSiteAuth } from "@/lib/site-auth";

const ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Brands", href: "/phones", icon: Smartphone },
  { label: "Comparison Tools", href: "/compare", icon: Swords, compact: true },
  { label: "Community", href: "/community", icon: Users },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, ready } = useSiteAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const profileHref = ready && user ? "/profile" : "/login";
  const profileLabel = ready && user ? "My Profile" : "Sign in";
  const profileActive = pathname.startsWith("/profile") || pathname === "/login";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[var(--surface-card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Mobile"
    >
      <ul className="flex items-stretch justify-around px-1 py-2">
        {ITEMS.map((item) => {
          const { label, href, icon: Icon } = item;
          const compact = "compact" in item && item.compact;
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition duration-150 ${
                  active
                    ? "text-[var(--electric-cyan)]"
                    : "text-[var(--text-secondary)]"
                }`}
                title={compact ? label : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span
                  className={
                    compact
                      ? "max-w-[4.25rem] text-center text-[8px] leading-tight"
                      : undefined
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={profileHref}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition duration-150 ${
              profileActive
                ? "text-[var(--electric-cyan)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <User size={20} strokeWidth={profileActive ? 2.5 : 2} />
            {profileLabel}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
