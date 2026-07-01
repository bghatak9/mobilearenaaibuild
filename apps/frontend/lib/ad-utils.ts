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

export const SITE_STICKY_PLACEMENTS = [
  "sticky-footer-mobile",
  "sticky-sidebar-desktop",
  "sticky-floating-corner",
] as const;

/** @deprecated Use SITE_STICKY_PLACEMENTS */
export const STICKY_FOOTER_PLACEMENT = SITE_STICKY_PLACEMENTS[0];

export const SITE_NATIVE_CARD_PLACEMENTS = [
  "homepage-mid",
  "native-sponsored-card",
  "native-recommended-product",
  "native-promoted-phone",
  "native-brand-sponsored",
] as const;

export const AFFILIATE_PLACEMENTS = [
  "affiliate-buy-now",
  "affiliate-amazon",
] as const;

export const IN_ARTICLE_PLACEMENTS = {
  top: ["in-article-top"] as const,
  middle: ["in-article-middle"] as const,
  end: ["in-article-end"] as const,
  between: ["in-article-between-sections"] as const,
};

export type SiteAdSlots = {
  topAd: PaidAdvertisement | null;
  stickyFooterAd: PaidAdvertisement | null;
  nativeCardAd: PaidAdvertisement | null;
};

export type AdDisplayVariant =
  | "banner"
  | "card"
  | "inline"
  | "skyscraper"
  | "affiliate"
  | "video";

export function pickAdForPlacement(
  ads: PaidAdvertisement[],
  placement: string,
  excludeIds: ReadonlySet<number> = new Set(),
): PaidAdvertisement | undefined {
  return ads.find((ad) => ad.placement === placement && !excludeIds.has(ad.id));
}

export function pickFirstAdForPlacements(
  ads: PaidAdvertisement[],
  placements: readonly string[],
  excludeIds: ReadonlySet<number> = new Set(),
): PaidAdvertisement | undefined {
  for (const placement of placements) {
    const ad = pickAdForPlacement(ads, placement, excludeIds);
    if (ad) return ad;
  }
  return undefined;
}

function pickFirstUnused(
  ads: PaidAdvertisement[],
  placements: readonly string[],
  used: Set<number>,
): PaidAdvertisement | null {
  const ad = pickFirstAdForPlacements(ads, placements, used);
  if (ad) used.add(ad.id);
  return ad ?? null;
}

/** Pick global ad slots once — each ad appears at most once per page. */
export function resolveSiteAdSlots(ads: PaidAdvertisement[]): SiteAdSlots {
  const used = new Set<number>();
  return {
    topAd: pickFirstUnused(ads, SITE_TOP_BANNER_PLACEMENTS, used),
    stickyFooterAd: pickFirstUnused(ads, SITE_STICKY_PLACEMENTS, used),
    nativeCardAd: pickFirstUnused(ads, SITE_NATIVE_CARD_PLACEMENTS, used),
  };
}

export function adsForPlacements(
  ads: PaidAdvertisement[],
  placements: string[],
  excludeIds: ReadonlySet<number> = new Set(),
): PaidAdvertisement[] {
  const seen = new Set<number>(excludeIds);
  const result: PaidAdvertisement[] = [];
  for (const placement of placements) {
    const ad = pickAdForPlacement(ads, placement, seen);
    if (ad && !seen.has(ad.id)) {
      seen.add(ad.id);
      result.push(ad);
    }
  }
  return result;
}

/** Resolve in-article slots without reusing global shell ads. */
export function resolveInArticleAdSlots(
  ads: PaidAdvertisement[],
  reservedIds: ReadonlySet<number> = new Set(),
): {
  top: PaidAdvertisement | null;
  middle: PaidAdvertisement | null;
  end: PaidAdvertisement | null;
  between: PaidAdvertisement | null;
} {
  const used = new Set<number>(reservedIds);
  return {
    top: pickFirstUnused(ads, IN_ARTICLE_PLACEMENTS.top, used),
    middle: pickFirstUnused(ads, IN_ARTICLE_PLACEMENTS.middle, used),
    end: pickFirstUnused(ads, IN_ARTICLE_PLACEMENTS.end, used),
    between: pickFirstUnused(ads, IN_ARTICLE_PLACEMENTS.between, used),
  };
}

export function reservedAdIds(slots: SiteAdSlots): Set<number> {
  const ids = new Set<number>();
  for (const ad of [slots.topAd, slots.stickyFooterAd, slots.nativeCardAd]) {
    if (ad) ids.add(ad.id);
  }
  return ids;
}

/** Map ad type + placement to the shared display variant rules. */
export function adDisplayVariant(ad: PaidAdvertisement): AdDisplayVariant {
  if (ad.adType === "video") return "video";
  if (ad.adType === "affiliate") return "affiliate";
  if (
    ad.adType === "native" ||
    ad.adType === "sponsored" ||
    ad.adType === "featured" ||
    SITE_NATIVE_CARD_PLACEMENTS.includes(
      ad.placement as (typeof SITE_NATIVE_CARD_PLACEMENTS)[number],
    )
  ) {
    return "card";
  }
  if (ad.placement.includes("skyscraper")) return "skyscraper";
  if (ad.placement.startsWith("in-article")) return "inline";
  return "banner";
}
