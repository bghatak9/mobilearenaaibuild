"use client";

import { Link } from "@/i18n/navigation";
import { Bell, Heart, User } from "lucide-react";

import { SiteLanguageSelect } from "@/components/layout/SiteLanguageSelect";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/design-system/utils/cn";

import { useSiteNavAccount } from "./use-site-nav-account";

type SiteNavToolbarProps = {
  layout: "desktop" | "mobile";
};

/** Shared header actions — keep desktop and mobile/tablet in sync. */
export function SiteNavToolbar({ layout }: SiteNavToolbarProps) {
  const { t } = useSiteLanguage();
  const {
    ready,
    user,
    accountLabel,
    notificationsHref,
    profileHref,
    profileLabel,
    profileShortLabel,
    favoritesHref,
  } = useSiteNavAccount();

  if (layout === "mobile") {
    return (
      <>
        <SiteLanguageSelect variant="mobile" />
        <ThemeToggle
          variant="nav"
          className="arena-mobile-header-btn arena-mobile-header-theme"
        />
        <Link
          href={notificationsHref}
          className="arena-mobile-header-btn"
          aria-label={t("action.notifications")}
          title={t("action.notifications")}
        >
          <Bell size={19} strokeWidth={2.25} />
        </Link>
        <Link
          href={profileHref}
          className="arena-mobile-header-signin"
          aria-label={ready && user ? t("action.myProfile") : t("action.signIn")}
          title={ready && user ? profileLabel : t("action.signIn")}
          suppressHydrationWarning
        >
          <User size={18} strokeWidth={2.25} className="arena-mobile-header-signin-icon" />
          <span className="arena-mobile-header-signin-text" suppressHydrationWarning>
            {ready && user ? profileShortLabel : t("action.signIn")}
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      <SiteLanguageSelect variant="desktop" />
      <ThemeToggle variant="nav" className="arena-floating-nav-icon arena-floating-nav-icon-theme" />
      <Link
        href={notificationsHref}
        className="arena-floating-nav-icon arena-floating-nav-icon-bell"
        aria-label={t("action.notifications")}
        title={t("action.notifications")}
      >
        <Bell size={18} />
      </Link>
      <Link
        href={favoritesHref}
        className="arena-floating-nav-icon arena-floating-nav-icon-heart inline-flex"
        aria-label={t("action.favorites")}
        title={t("action.favorites")}
      >
        <Heart size={18} />
      </Link>
      {ready && user ? (
        <Link
          href={profileHref}
          className="arena-floating-nav-icon arena-floating-nav-icon-profile"
          aria-label={t("action.myProfile")}
          title={accountLabel ?? t("action.myProfile")}
        >
          <User size={18} />
          <span className="hidden text-xs font-semibold sm:inline">{t("action.myProfile")}</span>
        </Link>
      ) : (
        <Link
          href={profileHref}
          className={cn(
            "arena-btn-primary arena-floating-nav-signin flex items-center gap-1.5 text-xs",
          )}
        >
          <User size={16} />
          {t("action.signIn")}
        </Link>
      )}
    </>
  );
}
