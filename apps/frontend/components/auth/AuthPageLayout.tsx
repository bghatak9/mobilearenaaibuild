"use client";

import { ArenaShellClient } from "@/components/layout/ArenaShellClient";
import type { SiteAdSlots } from "@/lib/ad-utils";

const AUTH_SLOTS: SiteAdSlots = {
  topAd: null,
  stickyFooterAd: null,
  nativeCardAd: null,
};

export function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <ArenaShellClient slots={AUTH_SLOTS} auth showAds={false}>
      <div id="fb-root" />
      <div className="arena-auth-shell py-3 sm:py-5">{children}</div>
    </ArenaShellClient>
  );
}
