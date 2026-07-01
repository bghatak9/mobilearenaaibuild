"use client";

import Link from "next/link";
import { Bell, Heart, User } from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/design-system/utils/cn";

import { useSiteNavAccount } from "./use-site-nav-account";

type SiteNavToolbarProps = {
  layout: "desktop" | "mobile";
};

/** Shared header actions — keep desktop and mobile/tablet in sync. */
export function SiteNavToolbar({ layout }: SiteNavToolbarProps) {
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
        <ThemeToggle
          variant="nav"
          className="arena-mobile-header-btn arena-mobile-header-theme"
        />
        <Link
          href={notificationsHref}
          className="arena-mobile-header-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} strokeWidth={2.25} />
        </Link>
        <Link
          href={profileHref}
          className="arena-mobile-header-signin"
          aria-label={profileLabel}
          title={profileLabel}
        >
          <User size={18} strokeWidth={2.25} className="arena-mobile-header-signin-icon" />
          <span className="arena-mobile-header-signin-text">{profileShortLabel}</span>
        </Link>
      </>
    );
  }

  return (
    <>
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
        href={favoritesHref}
        className="arena-floating-nav-icon arena-floating-nav-icon-heart inline-flex"
        aria-label="Favorite phones"
        title="Favorite phones"
      >
        <Heart size={18} />
      </Link>
      {ready && user ? (
        <Link
          href={profileHref}
          className="arena-floating-nav-icon arena-floating-nav-icon-profile"
          aria-label="My Profile"
          title={accountLabel ?? "My Profile"}
        >
          <User size={18} />
          <span className="hidden text-xs font-semibold sm:inline">My Profile</span>
        </Link>
      ) : (
        <Link
          href={profileHref}
          className={cn(
            "arena-btn-primary arena-floating-nav-signin flex items-center gap-1.5 text-xs",
          )}
        >
          <User size={16} />
          Sign in
        </Link>
      )}
    </>
  );
}
