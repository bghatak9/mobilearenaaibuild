import type { PaidAdvertisement } from "@/lib/api";

/** Placements tried in order for the site-wide top banner. */
export const SITE_TOP_BANNER_PLACEMENTS = [
  "homepage-top",
  "display-leaderboard-970x90",
  "display-header-728x90",
  "display-mobile-320x50",
] as const;

/** @deprecated Use SITE_TOP_BANNER_PLACEMENTS */
export const HOME_TOP_BANNER_PLACEMENTS = SITE_TOP_BANNER_PLACEMENTS;

export const STICKY_FOOTER_PLACEMENT = "sticky-footer-mobile";

export function pickAdForPlacement(
  ads: PaidAdvertisement[],
  placement: string,
): PaidAdvertisement | undefined {
  return ads.find((a) => a.placement === placement);
}

export function pickFirstAdForPlacements(
  ads: PaidAdvertisement[],
  placements: readonly string[],
): PaidAdvertisement | undefined {
  for (const placement of placements) {
    const ad = pickAdForPlacement(ads, placement);
    if (ad) return ad;
  }
  return undefined;
}

export function adsForPlacements(
  ads: PaidAdvertisement[],
  placements: string[],
): PaidAdvertisement[] {
  const seen = new Set<number>();
  const result: PaidAdvertisement[] = [];
  for (const placement of placements) {
    const ad = pickAdForPlacement(ads, placement);
    if (ad && !seen.has(ad.id)) {
      seen.add(ad.id);
      result.push(ad);
    }
  }
  return result;
}
