"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Heart, Mic, Search, X } from "lucide-react";

import { cn } from "@/design-system/utils/cn";
import { accentForNavHref } from "@/design-system/titan-spectrum/category-accents";
import {
  isSiteNavLinkActive,
  SITE_NAV_LINKS,
} from "@/design-system/navigation/site-nav-links";
import { useSiteNavAccount } from "@/design-system/navigation/use-site-nav-account";

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="arena-mobile-drawer-root lg:hidden" role="presentation">
      <button
        type="button"
        className="arena-mobile-drawer-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="arena-mobile-drawer-panel" aria-label="Site menu">
        <div className="arena-mobile-drawer-head">
          <Link href="/" className="arena-floating-nav-logo" onClick={onClose}>
            <span className="arena-floating-nav-logo-mobile">Mobile</span>
            <span className="arena-floating-nav-logo-arena">Arena</span>
          </Link>
          <button
            type="button"
            className="arena-mobile-header-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="arena-mobile-drawer-actions">
          <button
            type="button"
            className="arena-mobile-drawer-action"
            onClick={() => {
              onClose();
              onSearch();
            }}
          >
            <Search size={18} />
            Search
          </button>
          <button
            type="button"
            className="arena-mobile-drawer-action"
            onClick={() => {
              onClose();
              onVoiceSearch();
            }}
          >
            <Mic size={18} />
            Voice search
          </button>
          <Link
            href={favoritesHref}
            className="arena-mobile-drawer-action"
            onClick={onClose}
          >
            <Heart size={18} />
            Favorite phones
          </Link>
        </div>

        <nav className="arena-mobile-drawer-nav" aria-label="Main">
          {SITE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-titan-accent={accentForNavHref(link.href)}
              className={cn(
                "arena-mobile-drawer-link",
                isSiteNavLinkActive(link.href, pathname, search) &&
                  "arena-mobile-drawer-link-active",
              )}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
