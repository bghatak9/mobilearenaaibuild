"use client";

import { useEffect, useState } from "react";

import { getActiveAdvertisements } from "@/lib/api";
import { resolveSiteAdSlots, type SiteAdSlots } from "@/lib/ad-utils";

import { ArenaShellClient } from "./ArenaShellClient";

type ClientArenaShellProps = {
  children: React.ReactNode;
  auth?: boolean;
  showAds?: boolean;
};

const EMPTY_SLOTS: SiteAdSlots = {
  topAd: null,
  stickyFooterAd: null,
  nativeCardAd: null,
};

/** Client-side shell with ads — for pages that must stay client components. */
export function ClientArenaShell({
  children,
  auth = false,
  showAds,
}: ClientArenaShellProps) {
  const adsEnabled = showAds ?? !auth;
  const [slots, setSlots] = useState<SiteAdSlots>(EMPTY_SLOTS);

  useEffect(() => {
    if (!adsEnabled) {
      setSlots(EMPTY_SLOTS);
      return;
    }
    void getActiveAdvertisements()
      .then((ads) => setSlots(resolveSiteAdSlots(ads)))
      .catch(() => {
        /* ads optional */
      });
  }, [adsEnabled]);

  return (
    <ArenaShellClient slots={slots} auth={auth} showAds={adsEnabled}>
      {children}
    </ArenaShellClient>
  );
}
