/** Mobile layout applies below Tailwind `lg` (1024px). */
export const MOBILE_MEDIA_QUERY = "(max-width: 1023px)";

/** Compact sticky header (logo + category nav) through tablet portrait. */
export const COMPACT_HEADER_MEDIA_QUERY = "(max-width: 1023px)";

/** Desktop expanded nav at Tailwind `lg` (1024px) and up. */
export const DESKTOP_NAV_MEDIA_QUERY = "(min-width: 1024px)";

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function isCompactHeaderViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(COMPACT_HEADER_MEDIA_QUERY).matches;
}
