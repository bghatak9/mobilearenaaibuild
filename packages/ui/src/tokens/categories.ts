export type GadgetCategory =
  | "smartphones"
  | "tablets"
  | "laptops"
  | "wearables"
  | "audio"
  | "cameras"
  | "gaming";

export const categoryAccents: Record<
  GadgetCategory,
  { accent: string; glow: string; label: string }
> = {
  smartphones: { accent: "#3B82F6", glow: "rgba(59,130,246,0.18)", label: "Smartphones" },
  tablets: { accent: "#8B5CF6", glow: "rgba(139,92,246,0.18)", label: "Tablets" },
  laptops: { accent: "#06B6D4", glow: "rgba(6,182,212,0.18)", label: "Laptops" },
  wearables: { accent: "#22C55E", glow: "rgba(34,197,94,0.18)", label: "Wearables" },
  audio: { accent: "#F59E0B", glow: "rgba(245,158,11,0.18)", label: "Audio" },
  cameras: { accent: "#EC4899", glow: "rgba(236,72,153,0.18)", label: "Cameras" },
  gaming: { accent: "#EF4444", glow: "rgba(239,68,68,0.18)", label: "Gaming" },
};

const CATEGORY_ALIASES: Record<string, GadgetCategory> = {
  smartphone: "smartphones",
  smartphones: "smartphones",
  phone: "smartphones",
  phones: "smartphones",
  mobile: "smartphones",
  flagship: "smartphones",
  tablet: "tablets",
  tablets: "tablets",
  laptop: "laptops",
  laptops: "laptops",
  notebook: "laptops",
  wearable: "wearables",
  wearables: "wearables",
  watch: "wearables",
  smartwatch: "wearables",
  audio: "audio",
  headphones: "audio",
  earbuds: "audio",
  camera: "cameras",
  cameras: "cameras",
  gaming: "gaming",
  console: "gaming",
};

export function resolveGadgetCategory(
  nameOrSlug?: string | null,
): GadgetCategory {
  if (!nameOrSlug) return "smartphones";
  const key = nameOrSlug.toLowerCase().replace(/[\s_-]+/g, "");
  return CATEGORY_ALIASES[key] ?? "smartphones";
}

export function getCategoryClass(nameOrSlug?: string | null): string {
  const cat = resolveGadgetCategory(nameOrSlug);
  return `category-${cat}`;
}

export function getCategoryAccent(nameOrSlug?: string | null): string {
  return categoryAccents[resolveGadgetCategory(nameOrSlug)].accent;
}
