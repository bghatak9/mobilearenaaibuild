"use client";

import { useEffect, useState } from "react";

import type { PaidAdvertisement } from "@/lib/api";
import { getActiveAdvertisements } from "@/lib/api";
import {
  pickAdForPlacement,
  pickFirstAdForPlacements,
  SITE_TOP_BANNER_PLACEMENTS,
  STICKY_FOOTER_PLACEMENT,
} from "@/lib/ad-utils";

import { ArenaShellClient } from "./ArenaShellClient";

type ClientArenaShellProps = {
  children: React.ReactNode;
  auth?: boolean;
};

/** Client-side shell with ads — for pages that must stay client components. */
export function ClientArenaShell({ children, auth = false }: ClientArenaShellProps) {
  const [topAd, setTopAd] = useState<PaidAdvertisement | null>(null);
  const [stickyFooterAd, setStickyFooterAd] = useState<PaidAdvertisement | null>(null);

  useEffect(() => {
    void getActiveAdvertisements()
      .then((ads) => {
        setTopAd(pickFirstAdForPlacements(ads, SITE_TOP_BANNER_PLACEMENTS) ?? null);
        setStickyFooterAd(pickAdForPlacement(ads, STICKY_FOOTER_PLACEMENT) ?? null);
      })
      .catch(() => {
        /* ads optional */
      });
  }, []);

  return (
    <ArenaShellClient topAd={topAd} stickyFooterAd={stickyFooterAd} auth={auth}>
      {children}
    </ArenaShellClient>
  );
}
