"use client";

import Link from "next/link";
import { Heart, Menu, Search } from "lucide-react";

import { useSiteNavAccount } from "@/design-system/navigation/use-site-nav-account";

import { SiteNavToolbar } from "./SiteNavToolbar";

type MobileCompactHeaderProps = {
  onMenuOpen: () => void;
  onSearch: () => void;
};

/** Phone / tablet top bar — compact layout. */
export function MobileCompactHeader({
  onMenuOpen,
  onSearch,
}: MobileCompactHeaderProps) {
  const { favoritesHref } = useSiteNavAccount();

  return (
    <div className="arena-mobile-header-top">
      <div className="arena-mobile-header-row">
        <div className="arena-mobile-header-side arena-mobile-header-side-left">
          <button
            type="button"
            className="arena-mobile-header-btn"
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className="arena-mobile-header-btn"
            onClick={onSearch}
            aria-label="Search"
            title="Search"
          >
            <Search size={19} strokeWidth={2.25} />
          </button>
          <Link
            href={favoritesHref}
            className="arena-mobile-header-btn arena-mobile-header-favorites"
            aria-label="Favorite phones"
            title="Favorite phones"
          >
            <Heart size={19} strokeWidth={2.25} />
          </Link>
        </div>

        <Link href="/" className="arena-mobile-header-logo" aria-label="MobileArena home">
          <span className="arena-mobile-header-logo-mobile">Mobile</span>
          <span className="arena-mobile-header-logo-arena">Arena</span>
        </Link>

        <div className="arena-mobile-header-side arena-mobile-header-side-right">
          <SiteNavToolbar layout="mobile" />
        </div>
      </div>
    </div>
  );
}
