/**
 * Titan Spectrum — category-driven accent colors for navigation & sections.
 */

export type TitanAccent =
  | "blue"
  | "purple"
  | "cyan"
  | "green"
  | "orange"
  | "pink";

export const TITAN_ACCENTS: Record<
  TitanAccent,
  { label: string; cssVar: string; hex: string }
> = {
  blue: { label: "Blue", cssVar: "--titan-blue", hex: "#5B8AFF" },
  purple: { label: "Purple", cssVar: "--titan-purple", hex: "#A67BFF" },
  cyan: { label: "Cyan", cssVar: "--titan-cyan", hex: "#3DD9C8" },
  green: { label: "Green", cssVar: "--titan-green", hex: "#4ADE80" },
  orange: { label: "Orange", cssVar: "--titan-orange", hex: "#FFA04D" },
  pink: { label: "Pink", cssVar: "--titan-pink", hex: "#FF7EB3" },
};

/** Accent per main nav destination */
export const NAV_LINK_ACCENTS: Record<string, TitanAccent> = {
  "/phones": "blue",
  "/phone-finder": "cyan",
  "/compare": "purple",
  "/phones?upcoming=1": "green",
  "/news": "orange",
  "/reviews": "pink",
  "/community": "purple",
  "/contact": "green",
};

export function accentForNavHref(href: string): TitanAccent {
  return NAV_LINK_ACCENTS[href] ?? "cyan";
}

export function accentForPathname(pathname: string, search = ""): TitanAccent {
  const full = search ? `${pathname}?${search}` : pathname;

  if (full.includes("upcoming=1")) return "green";
  if (full.includes("favorites=1")) return "pink";
  if (pathname.startsWith("/phone-finder")) return "cyan";
  if (pathname.startsWith("/compare")) return "purple";
  if (pathname.startsWith("/news")) return "orange";
  if (pathname.startsWith("/reviews")) return "pink";
  if (pathname.startsWith("/community")) return "purple";
  if (pathname.startsWith("/contact")) return "green";
  if (pathname === "/phones" || pathname.startsWith("/phones/")) return "blue";

  return "cyan";
}
