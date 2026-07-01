"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Search } from "lucide-react";

import { GlobalSearchPalette } from "@/components/search/GlobalSearchPalette";
import { MobileCategoryNav } from "@/design-system/navigation/MobileCategoryNav";
import { MobileCompactHeader } from "@/design-system/navigation/MobileCompactHeader";
import { MobileMenuDrawer } from "@/design-system/navigation/MobileMenuDrawer";
import { SiteNavToolbar } from "@/design-system/navigation/SiteNavToolbar";
import {
  isSiteNavLinkActive,
  SITE_NAV_LINKS,
} from "@/design-system/navigation/site-nav-links";
import { accentForNavHref } from "@/design-system/titan-spectrum/category-accents";
import { cn } from "@/design-system/utils/cn";

const NAV_LINKS = SITE_NAV_LINKS;

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

export function FloatingNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [voiceOnOpen, setVoiceOnOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      const mobile = window.matchMedia("(max-width: 1023px)").matches;

      setScrolled(y > 24);

      if (mobile) {
        setHidden(false);
      } else if (y < 72) {
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

  return (
    <>
      <header
        id="arena-site-header"
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full max-w-[100vw] overflow-hidden lg:inset-x-auto lg:left-1/2 lg:w-[min(1120px,calc(100%-1.5rem))] lg:max-w-none lg:overflow-visible lg:-translate-x-1/2",
          "transition-[transform,opacity,top] duration-300 ease-out",
          hidden
            ? "lg:pointer-events-none lg:-translate-y-[calc(100%+1.5rem)] lg:opacity-0"
            : "lg:translate-y-0 lg:opacity-100",
          scrolled ? "lg:top-2" : "lg:top-4",
        )}
      >
        <div className="arena-mobile-site-header lg:hidden">
          <MobileCompactHeader
            onMenuOpen={() => setMenuOpen(true)}
            onSearch={() => openSearch()}
          />
          <MobileCategoryNav />
        </div>

        <div className="hidden lg:block">
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
                  <SiteNavToolbar layout="desktop" />
                </div>
              </div>

              <div className="arena-floating-nav-links">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-titan-accent={accentForNavHref(link.href)}
                    className={cn(
                      "arena-floating-nav-link rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                      isSiteNavLinkActive(link.href, pathname, search) &&
                        "arena-floating-nav-link-active",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => openSearch()}
        onVoiceSearch={() => openSearch("", true)}
      />

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
