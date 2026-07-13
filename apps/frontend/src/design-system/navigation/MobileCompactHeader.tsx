"use client";

import { Link } from "@/i18n/navigation";
import { Heart, Menu, Search } from "lucide-react";

import { SiteLogo } from "@/components/brand/SiteLogo";
import { useSiteNavAccount } from "@/design-system/navigation/use-site-nav-account";
import { useSiteLanguage } from "@/lib/site-language";

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
  const { t } = useSiteLanguage();

  return (
    <div className="arena-mobile-header-top">
      <div className="arena-mobile-header-row">
        <div className="arena-mobile-header-side arena-mobile-header-side-left">
          <button
            type="button"
            className="arena-mobile-header-btn"
            onClick={onMenuOpen}
            aria-label={t("action.openMenu")}
          >
            <Menu size={20} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className="arena-mobile-header-btn"
            onClick={onSearch}
            aria-label={t("action.search")}
            title={t("action.search")}
          >
            <Search size={19} strokeWidth={2.25} />
          </button>
          <Link
            href={favoritesHref}
            className="arena-mobile-header-btn arena-mobile-header-favorites"
            aria-label={t("action.favorites")}
            title={t("action.favorites")}
          >
            <Heart size={19} strokeWidth={2.25} />
          </Link>
        </div>

        <SiteLogo variant="mobile" />

        <div className="arena-mobile-header-side arena-mobile-header-side-right">
          <SiteNavToolbar layout="mobile" />
        </div>
      </div>
    </div>
  );
}
