"use client";

import { useSiteAuth } from "@/lib/site-auth";
import { userDisplayId } from "@/lib/user-display-id";
import { useClientMounted } from "@/hooks/useClientMounted";

import { FAVORITES_HREF } from "./site-nav-links";

export function useSiteNavAccount() {
  const { user, ready } = useSiteAuth();
  const mounted = useClientMounted();
  const hydrated = mounted && ready;

  const accountLabel =
    user?.name?.trim() || (user?.email ? userDisplayId(user.email) : null);

  const notificationsHref = "/notifications";

  const profileHref = hydrated && user ? "/profile" : "/login";
  const profileLabel = hydrated && user ? "My Profile" : "Sign in";
  const profileShortLabel = hydrated && user ? "Profile" : "Sign in";

  return {
    ready: hydrated,
    user: hydrated ? user : null,
    accountLabel,
    notificationsHref,
    profileHref,
    profileLabel,
    profileShortLabel,
    favoritesHref: FAVORITES_HREF,
  };
}
