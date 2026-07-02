"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, Search } from "lucide-react";

import { GlobalSearchPalette } from "@/components/search/GlobalSearchPalette";
import { MobileCategoryNav } from "@/design-system/navigation/MobileCategoryNav";
import { MobileCompactHeader } from "@/design-system/navigation/MobileCompactHeader";
import { MobileMenuDrawer } from "@/design-system/navigation/MobileMenuDrawer";
import { SiteNavToolbar } from "@/design-system/navigation/SiteNavToolbar";
import { DesktopSiteNavItem } from "@/design-system/navigation/DesktopSiteNavItem";
import { SITE_NAV_LINKS } from "@/design-system/navigation/site-nav-links";
import { useScrollHideHeader } from "@/design-system/navigation/use-scroll-hide-header";
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
  const { headerHidden, setHeaderHidden, scrolled } = useScrollHideHeader();
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [voiceOnOpen, setVoiceOnOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    setHeaderHidden(false);
    setMenuOpen(false);
    document.documentElement.removeAttribute("data-site-header-hidden");
    window.dispatchEvent(new CustomEvent("arena:navigate"));
  }, [pathname, setHeaderHidden]);

  useEffect(() => {
    const html = document.documentElement;

    if (headerHidden) {
      html.setAttribute("data-site-header-hidden", "true");
    } else {
      html.removeAttribute("data-site-header-hidden");
    }

    return () => {
      html.removeAttribute("data-site-header-hidden");
    };
  }, [headerHidden]);

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

  const header = (
    <header
      id="arena-site-header"
      className={cn(
        "arena-shell-header fixed inset-x-0 top-0 z-[60] box-border w-full max-w-[100vw]",
        "xl:mx-auto xl:max-w-[var(--arena-content-max)]",
        "transition-[transform,top,box-shadow,background] duration-300 ease-out",
        scrolled && "arena-shell-header-scrolled",
        scrolled ? "xl:top-2" : "xl:top-[var(--arena-content-gutter)]",
        headerHidden && "arena-site-header--hidden",
      )}
    >
      <div
        className={cn(
          "arena-mobile-site-header xl:hidden",
          scrolled && "arena-mobile-site-header-scrolled",
        )}
      >
        <MobileCompactHeader
          onMenuOpen={() => setMenuOpen(true)}
          onSearch={() => openSearch()}
        />
        <MobileCategoryNav />
      </div>

      <div className="hidden w-full min-w-0 xl:block">
        <div className="arena-gradient-ring arena-gradient-ring-compact arena-gradient-ring-nav w-full min-w-0">
          <nav
            className={cn(
              "arena-floating-nav arena-gradient-ring-inner flex w-full min-w-0 flex-col gap-2.5 px-3 transition-all duration-300 ease-out lg:px-4 xl:px-5",
              scrolled ? "py-2.5" : "py-3.5",
            )}
            aria-label="Main"
          >
            <div className="relative z-[2] flex w-full min-w-0 flex-nowrap items-center gap-2 xl:gap-3">
              <Link href="/" className="arena-floating-nav-logo shrink-0">
                <span className="arena-floating-nav-logo-mobile">Mobile</span>
                <span className="arena-floating-nav-logo-arena">Arena</span>
              </Link>

              <div className="arena-floating-nav-search-wrap min-w-0 flex-1 basis-[12rem]">
                <div className="arena-floating-nav-search min-w-0">
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

              <div className="arena-floating-nav-toolbar shrink-0">
                <SiteNavToolbar layout="desktop" />
              </div>
            </div>

            <div className="arena-floating-nav-links">
              {NAV_LINKS.map((link) => (
                <DesktopSiteNavItem
                  key={link.href}
                  label={link.label}
                  href={link.href}
                  icon={link.icon}
                  pathname={pathname}
                  search={search}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );

  return (
    <>
      {portalReady ? createPortal(header, document.body) : header}

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
