import type { MessageKey } from "@/features/i18n";

export type SiteNavIcon =
  | "brands"
  | "finder"
  | "compare"
  | "upcoming"
  | "news"
  | "reviews"
  | "community"
  | "ev"
  | "contact";

export const SITE_NAV_MESSAGE_KEYS: Record<
  SiteNavIcon,
  { label: MessageKey; shortLabel: MessageKey }
> = {
  brands: { label: "nav.brands", shortLabel: "nav.brands" },
  finder: { label: "nav.phoneFinder", shortLabel: "nav.phoneFinder" },
  compare: { label: "nav.comparisonTools", shortLabel: "nav.comparisonTools" },
  upcoming: { label: "nav.upcomingDevices", shortLabel: "nav.upcomingDevices" },
  news: { label: "nav.news", shortLabel: "nav.news" },
  reviews: { label: "nav.reviews", shortLabel: "nav.reviews" },
  community: { label: "nav.community", shortLabel: "nav.community" },
  ev: { label: "nav.ev", shortLabel: "nav.ev" },
  contact: { label: "nav.contact", shortLabel: "nav.contactShort" },
};

export const SITE_NAV_LINKS = [
  { label: "Brands", shortLabel: "Brands", href: "/brands", icon: "brands" as const },
  { label: "Phone Finder", shortLabel: "Phone Finder", href: "/phone-finder", icon: "finder" as const },
  { label: "Comparison Tools", shortLabel: "Comparison Tools", href: "/compare", icon: "compare" as const },
  { label: "Upcoming Devices", shortLabel: "Upcoming Devices", href: "/phones?upcoming=1", icon: "upcoming" as const },
  { label: "News", shortLabel: "News", href: "/news", icon: "news" as const },
  { label: "Reviews", shortLabel: "Reviews", href: "/reviews", icon: "reviews" as const },
  { label: "Community", shortLabel: "Community", href: "/community", icon: "community" as const },
  { label: "EV", shortLabel: "EV", href: "/ev", icon: "ev" as const },
  { label: "Contact Us", shortLabel: "Contact", href: "/contact", icon: "contact" as const },
] as const;

export const FAVORITES_HREF = "/phones?favorites=1";

function hrefQuery(href: string): string {
  const idx = href.indexOf("?");
  return idx === -1 ? "" : href.slice(idx + 1);
}

function hrefPath(href: string): string {
  const idx = href.indexOf("?");
  return idx === -1 ? href : href.slice(0, idx);
}

function queryMatches(targetQuery: string, search: string): boolean {
  if (!targetQuery) return !search;
  const target = new URLSearchParams(targetQuery);
  const current = new URLSearchParams(search);
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) return false;
  }
  return true;
}

export function isSiteNavLinkActive(
  href: string,
  pathname: string,
  search = "",
): boolean {
  const path = hrefPath(href);
  const query = hrefQuery(href);

  if (path === "/") {
    return pathname === "/" && !search;
  }

  if (path === "/brands") {
    return pathname === "/brands" || pathname.startsWith("/brands/");
  }

  if (path === "/phones") {
    const onPhones =
      pathname === "/phones" || pathname.startsWith("/phones/");
    if (!onPhones || pathname.includes("phone-finder")) return false;

    if (query) return queryMatches(query, search);
    return !search.includes("upcoming=1") && !search.includes("favorites=1");
  }

  if (query) {
    return pathname === path && queryMatches(query, search);
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}
