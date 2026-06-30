import { getActiveAdvertisements } from "@/lib/api";
import {
  pickAdForPlacement,
  pickFirstAdForPlacements,
  SITE_TOP_BANNER_PLACEMENTS,
  STICKY_FOOTER_PLACEMENT,
} from "@/lib/ad-utils";

import { ArenaShellClient } from "./ArenaShellClient";

type ArenaShellProps = {
  children: React.ReactNode;
  /** Tighter vertical spacing for sign-in / sign-up flows on small screens */
  auth?: boolean;
};

export async function ArenaShell({ children, auth = false }: ArenaShellProps) {
  const ads = await getActiveAdvertisements().catch(() => []);
  const topAd = pickFirstAdForPlacements(ads, SITE_TOP_BANNER_PLACEMENTS) ?? null;
  const stickyFooterAd = pickAdForPlacement(ads, STICKY_FOOTER_PLACEMENT) ?? null;

  return (
    <ArenaShellClient topAd={topAd} stickyFooterAd={stickyFooterAd} auth={auth}>
      {children}
    </ArenaShellClient>
  );
}
