"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, Search } from "lucide-react";

import { SiteLogo } from "@/components/brand/SiteLogo";
import { GlobalSearchPalette } from "@/components/search/GlobalSearchPalette";
import { MobileCategoryNav } from "@/design-system/navigation/MobileCategoryNav";
import { MobileCompactHeader } from "@/design-system/navigation/MobileCompactHeader";
import { MobileMenuDrawer } from "@/design-system/navigation/MobileMenuDrawer";
import { SiteNavToolbar } from "@/design-system/navigation/SiteNavToolbar";
import { SiteSocialLinks } from "@/design-system/navigation/SiteSocialLinks";
import { DesktopSiteNavItem } from "@/design-system/navigation/DesktopSiteNavItem";
import {
  SITE_NAV_LINKS,
  SITE_NAV_MESSAGE_KEYS,
} from "@/design-system/navigation/site-nav-links";
import { useScrollHideHeader } from "@/design-system/navigation/use-scroll-hide-header";
import { useSiteLanguage } from "@/lib/site-language";
import { stripLocalePrefix } from "@/lib/locale-path";
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
  const rawPathname = usePathname();
  const pathname = stripLocalePrefix(rawPathname);
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { headerHidden, setHeaderHidden, scrolled } = useScrollHideHeader();
  const { t } = useSiteLanguage();
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
        "arena-shell-header arena-shell-header--fullbleed arena-intl-chrome notranslate fixed left-0 right-0 top-0 z-[60] box-border w-full max-w-none",
        "transition-[transform,top,box-shadow,background] duration-300 ease-out",
        scrolled && "arena-shell-header-scrolled",
        headerHidden && "arena-site-header--hidden",
      )}
      translate="no"
    >
      <div
        className={cn(
          "arena-mobile-site-header lg:hidden",
          scrolled && "arena-mobile-site-header-scrolled",
        )}
      >
        <MobileCompactHeader
          onMenuOpen={() => setMenuOpen(true)}
          onSearch={() => openSearch()}
        />
        <MobileCategoryNav />
      </div>

      <div className="arena-desktop-site-header hidden w-full min-w-0 lg:block">
        <nav
          className={cn(
            "arena-floating-nav arena-floating-nav--hub flex w-full min-w-0 flex-col gap-2.5 py-3",
            scrolled && "py-2.5",
          )}
          aria-label="Main"
        >
          <div className="arena-floating-nav-top relative z-[2] flex w-full min-w-0 flex-nowrap items-center gap-2 xl:gap-3">
            <SiteLogo className="shrink-0" />

            <div className="arena-floating-nav-search-wrap min-w-0 flex-1 basis-[12rem]">
              <div className="arena-floating-nav-search min-w-0">
                <button
                  type="button"
                  onClick={() => openSearch()}
                  className="arena-floating-nav-search-btn"
                >
                  <Search size={17} className="arena-floating-nav-search-icon" />
                  <span className="flex-1 truncate">{t("search.placeholder")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openSearch("", true)}
                  className="arena-floating-nav-mic"
                  aria-label={t("action.voiceSearch")}
                  title={t("action.voiceSearch")}
                >
                  <Mic size={17} />
                </button>
              </div>
            </div>

            <SiteSocialLinks className="shrink-0" />

            <div className="arena-floating-nav-toolbar shrink-0">
              <SiteNavToolbar layout="desktop" />
            </div>
          </div>

          <div className="arena-floating-nav-links">
            {NAV_LINKS.map((link) => {
              const keys = SITE_NAV_MESSAGE_KEYS[link.icon];
              return (
                <DesktopSiteNavItem
                  key={link.href}
                  label={t(keys.label)}
                  shortLabel={t(keys.shortLabel)}
                  href={link.href}
                  icon={link.icon}
                  pathname={pathname}
                  search={search}
                />
              );
            })}
          </div>
        </nav>
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
