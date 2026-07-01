import type { PaidAdvertisement } from "@/lib/api";
import { getActiveAdvertisements } from "@/lib/api";
import { resolveSiteAdSlots } from "@/lib/ad-utils";

import { ArenaShellClient } from "./ArenaShellClient";

const EMPTY_SLOTS = {
  topAd: null,
  stickyFooterAd: null,
  nativeCardAd: null,
} as const;

type ArenaShellProps = {
  children: React.ReactNode;
  /** Tighter vertical spacing for sign-in / sign-up flows on small screens */
  auth?: boolean;
  /** Hide all ad slots (auth pages default to false) */
  showAds?: boolean;
  /** Preloaded ads — avoids a second fetch when the page already loaded them */
  ads?: PaidAdvertisement[];
};

export async function ArenaShell({
  children,
  auth = false,
  showAds,
  ads: preloadedAds,
}: ArenaShellProps) {
  const adsEnabled = showAds ?? !auth;
  const ads = adsEnabled
    ? (preloadedAds ?? (await getActiveAdvertisements().catch(() => [])))
    : [];
  const slots = adsEnabled ? resolveSiteAdSlots(ads) : EMPTY_SLOTS;

  return (
    <ArenaShellClient slots={slots} auth={auth} showAds={adsEnabled}>
      {children}
    </ArenaShellClient>
  );
}
