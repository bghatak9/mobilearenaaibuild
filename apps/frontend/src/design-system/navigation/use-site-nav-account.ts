"use client";

import { useSiteAuth } from "@/lib/site-auth";
import { userDisplayId } from "@/lib/user-display-id";

import { FAVORITES_HREF } from "./site-nav-links";

export function useSiteNavAccount() {
  const { user, ready } = useSiteAuth();

  const accountLabel =
    user?.name?.trim() || (user?.email ? userDisplayId(user.email) : null);

  const notificationsHref =
    ready && user
      ? "/notifications"
      : `/login?next=${encodeURIComponent("/notifications")}`;

  const profileHref = ready && user ? "/profile" : "/login";
  const profileLabel = ready && user ? "My Profile" : "Sign in";
  const profileShortLabel = ready && user ? "Profile" : "Sign in";

  return {
    ready,
    user,
    accountLabel,
    notificationsHref,
    profileHref,
    profileLabel,
    profileShortLabel,
    favoritesHref: FAVORITES_HREF,
  };
}
