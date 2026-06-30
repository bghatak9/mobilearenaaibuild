"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Heart, Mic, Search, User } from "lucide-react";

import { GlobalSearchPalette } from "@/components/search/GlobalSearchPalette";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/design-system/utils/cn";
import { useSiteAuth } from "@/lib/site-auth";
import { userDisplayId } from "@/lib/user-display-id";

const NAV_LINKS = [
  { label: "Brands", href: "/phones" },
  { label: "Phone Finder", href: "/phone-finder" },
  { label: "Comparison Tools", href: "/compare" },
  { label: "Upcoming Devices", href: "/phones?upcoming=1" },
  { label: "News", href: "/news" },
  { label: "Community", href: "/community" },
  { label: "Contact", href: "/contact" },
];

const RECENT_KEY = "mobilearena:recent-devices";

type RecentDevice = { name: string; slug: string };

function readRecent(): RecentDevice[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentDevice[];
  } catch {
    return [];
  }
}

function navLinkActive(href: string, pathname: string): boolean {
  if (href === "/phones") {
    return pathname === "/phones" || pathname.startsWith("/phones/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FloatingNav() {
  const pathname = usePathname();
  const { user, ready } = useSiteAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [voiceOnOpen, setVoiceOnOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      setScrolled(y > 24);

      if (y < 72) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = useCallback((seed = "", withVoice = false) => {
    setQuery(seed);
    setVoiceOnOpen(withVoice);
    setPaletteOpen(true);
  }, []);

  const accountLabel =
    user?.name?.trim() || (user?.email ? userDisplayId(user.email) : null);

  const notificationsHref =
    ready && user
      ? "/notifications"
      : `/login?next=${encodeURIComponent("/notifications")}`;

  return (
    <>
      <header
        className={cn(
          "fixed left-1/2 z-50 w-[min(1120px,calc(100%-1.5rem))] -translate-x-1/2 transition-[transform,opacity,top] duration-300 ease-out",
          hidden
            ? "pointer-events-none -translate-y-[calc(100%+1.5rem)] opacity-0"
            : "translate-y-0 opacity-100",
          scrolled ? "top-2" : "top-4",
        )}
      >
        <div className="arena-gradient-ring arena-gradient-ring-compact arena-gradient-ring-nav">
          <nav
            className={cn(
              "arena-floating-nav arena-gradient-ring-inner flex flex-col gap-3 px-4 backdrop-blur-xl transition-all duration-200 md:px-6",
              scrolled ? "py-2" : "py-4",
            )}
            aria-label="Main"
          >
          <div className="arena-floating-nav-glow" aria-hidden>
            <span className="arena-floating-nav-orb arena-floating-nav-orb-cyan" />
            <span className="arena-floating-nav-orb arena-floating-nav-orb-purple" />
            <span className="arena-floating-nav-orb arena-floating-nav-orb-blue" />
          </div>

          <div className="relative z-[2] flex items-center gap-3">
            <Link href="/" className="arena-floating-nav-logo shrink-0">
              <span className="arena-floating-nav-logo-mobile">Mobile</span>
              <span className="arena-floating-nav-logo-arena">Arena</span>
            </Link>

            <div className="arena-floating-nav-search-wrap">
              <div className="arena-floating-nav-search">
                <button
                  type="button"
                  onClick={() => openSearch()}
                  className="arena-floating-nav-search-btn"
                >
                  <Search size={17} className="arena-floating-nav-search-icon" />
                  <span className="flex-1 truncate">Search phones, brands, specs…</span>
                </button>
                <button
                  type="button"
                  onClick={() => openSearch("", true)}
                  className="arena-floating-nav-mic"
                  aria-label="Voice search"
                  title="Speak to search"
                >
                  <Mic size={17} />
                </button>
              </div>
            </div>

            <div className="arena-floating-nav-toolbar">
              <ThemeToggle variant="nav" className="arena-floating-nav-icon arena-floating-nav-icon-theme" />
              <Link
                href={notificationsHref}
                className="arena-floating-nav-icon arena-floating-nav-icon-bell"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
              </Link>
              <Link
                href="/phones?favorites=1"
                className="arena-floating-nav-icon arena-floating-nav-icon-heart hidden sm:inline-flex"
                aria-label="Favorite phones"
                title="Favorite phones"
              >
                <Heart size={18} />
              </Link>
              {ready && user ? (
                <Link
                  href="/profile"
                  className="arena-floating-nav-icon arena-floating-nav-icon-profile"
                  aria-label="My Profile"
                  title={accountLabel ?? "My Profile"}
                >
                  <User size={18} />
                  <span className="hidden text-xs font-semibold sm:inline">My Profile</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="arena-btn-primary arena-floating-nav-signin flex items-center gap-1.5 text-xs"
                >
                  <User size={16} />
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="arena-floating-nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "arena-floating-nav-link rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                  navLinkActive(link.href, pathname) && "arena-floating-nav-link-active",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          </nav>
        </div>
      </header>

      <GlobalSearchPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        initialQuery={query}
        voiceOnOpen={voiceOnOpen}
        onVoiceStarted={() => setVoiceOnOpen(false)}
      />
    </>
  );
}

/** Call from device detail pages to populate global search recents */
export function trackRecentDevice(device: RecentDevice) {
  if (typeof window === "undefined") return;
  const list = readRecent().filter((d) => d.slug !== device.slug);
  list.unshift(device);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
}
