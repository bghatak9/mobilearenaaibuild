export const SITE_NAV_LINKS = [
  { label: "Brands", href: "/phones" },
  { label: "Phone Finder", href: "/phone-finder" },
  { label: "Comparison Tools", href: "/compare" },
  { label: "Upcoming Devices", href: "/phones?upcoming=1" },
  { label: "News", href: "/news" },
  { label: "Reviews", href: "/reviews" },
  { label: "Community", href: "/community" },
  { label: "Contact", href: "/contact" },
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
