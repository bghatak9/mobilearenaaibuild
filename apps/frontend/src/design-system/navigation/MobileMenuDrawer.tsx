"use client";

import { Link } from "@/i18n/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { Heart, Mic, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { SiteLanguageSelect } from "@/components/layout/SiteLanguageSelect";
import {
  SITE_NAV_LINKS,
  SITE_NAV_MESSAGE_KEYS,
} from "@/design-system/navigation/site-nav-links";
import { MobileDrawerNavItem } from "@/design-system/navigation/MobileDrawerNavItem";
import { useSiteNavAccount } from "@/design-system/navigation/use-site-nav-account";
import { SiteSocialLinks } from "@/design-system/navigation/SiteSocialLinks";
import { useSiteLanguage } from "@/lib/site-language";

type MobileMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  onVoiceSearch: () => void;
};

export function MobileMenuDrawer({
  open,
  onClose,
  onSearch,
  onVoiceSearch,
}: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { favoritesHref } = useSiteNavAccount();
  const { t } = useSiteLanguage();
  const tA11y = useTranslations("a11y");
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="arena-mobile-drawer-root arena-intl-chrome notranslate lg:hidden"
      role="presentation"
      translate="no"
    >
      <button
        type="button"
        className="arena-mobile-drawer-backdrop"
        aria-label={t("action.closeMenu")}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className="arena-mobile-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="arena-mobile-drawer-head">
          <span id={titleId} className="arena-mobile-drawer-title">
            {t("action.menu")}
          </span>
          <button
            ref={closeRef}
            type="button"
            className="arena-mobile-header-btn"
            onClick={onClose}
            aria-label={tA11y("closeDialog")}
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        <div className="arena-mobile-drawer-actions">
          <SiteLanguageSelect variant="drawer" className="w-full" />
          <button
            type="button"
            className="arena-mobile-drawer-action"
            onClick={() => {
              onClose();
              onSearch();
            }}
            aria-label={t("action.search")}
          >
            <Search size={18} aria-hidden />
            <span>{t("action.search")}</span>
          </button>
          <button
            type="button"
            className="arena-mobile-drawer-action"
            onClick={() => {
              onClose();
              onVoiceSearch();
            }}
            aria-label={t("action.voiceSearch")}
          >
            <Mic size={18} aria-hidden />
            <span>{t("action.voiceSearch")}</span>
          </button>
          <Link
            href={favoritesHref}
            className="arena-mobile-drawer-action"
            onClick={onClose}
          >
            <Heart size={18} aria-hidden />
            <span>{t("action.favorites")}</span>
          </Link>
        </div>

        <nav className="arena-mobile-drawer-nav" aria-label={t("action.menu")}>
          {SITE_NAV_LINKS.map((link) => {
            const keys = SITE_NAV_MESSAGE_KEYS[link.icon];
            return (
              <MobileDrawerNavItem
                key={link.href}
                label={t(keys.label)}
                href={link.href}
                pathname={pathname}
                search={search}
                onNavigate={onClose}
              />
            );
          })}
        </nav>

        <div className="arena-mobile-drawer-foot">
          <SiteSocialLinks />
        </div>
      </aside>
    </div>
  );
}
