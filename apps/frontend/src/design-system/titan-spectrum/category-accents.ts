/**
 * Titan Spectrum v1.0 — category-driven accent colors.
 */

export type TitanAccent =
  | "blue"
  | "purple"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "red";

export type GadgetCategory =
  | "smartphone"
  | "tablet"
  | "laptop"
  | "wearable"
  | "audio"
  | "camera"
  | "gaming";

export const GADGET_CATEGORY_ACCENTS: Record<
  GadgetCategory,
  { accent: string; label: string }
> = {
  smartphone: { accent: "#3B82F6", label: "Smartphones" },
  tablet: { accent: "#8B5CF6", label: "Tablets" },
  laptop: { accent: "#06B6D4", label: "Laptops" },
  wearable: { accent: "#22C55E", label: "Wearables" },
  audio: { accent: "#F59E0B", label: "Audio" },
  camera: { accent: "#EC4899", label: "Cameras" },
  gaming: { accent: "#EF4444", label: "Gaming" },
};

export const TITAN_ACCENTS: Record<
  TitanAccent,
  { label: string; cssVar: string; hex: string }
> = {
  blue: { label: "Blue", cssVar: "--blue", hex: "#3B82F6" },
  purple: { label: "Purple", cssVar: "--purple", hex: "#8B5CF6" },
  cyan: { label: "Cyan", cssVar: "--cyan", hex: "#06B6D4" },
  green: { label: "Green", cssVar: "--green", hex: "#22C55E" },
  orange: { label: "Orange", cssVar: "--orange", hex: "#F59E0B" },
  pink: { label: "Pink", cssVar: "--pink", hex: "#EC4899" },
  red: { label: "Red", cssVar: "--red", hex: "#EF4444" },
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

export function gadgetCategoryFromName(name?: string | null): GadgetCategory {
  const n = (name ?? "").toLowerCase();
  if (n.includes("tablet")) return "tablet";
  if (n.includes("laptop") || n.includes("notebook")) return "laptop";
  if (n.includes("watch") || n.includes("wearable") || n.includes("band"))
    return "wearable";
  if (n.includes("audio") || n.includes("earbud") || n.includes("headphone"))
    return "audio";
  if (n.includes("camera")) return "camera";
  if (n.includes("gaming") || n.includes("console")) return "gaming";
  return "smartphone";
}
