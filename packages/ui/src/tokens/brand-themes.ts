/**
 * Subtle brand accent colors — never imitate official branding exactly.
 */
export const brandThemes = {
  samsung: "#2563EB",
  apple: "#64748B",
  xiaomi: "#F97316",
  oneplus: "#DC2626",
  google: "#14B8A6",
  nothing: "#E5E7EB",
  vivo: "#3B82F6",
  oppo: "#10B981",
  realme: "#FACC15",
  motorola: "#6366F1",
} as const;

export type BrandSlug = keyof typeof brandThemes;

export function getBrandColor(brandName?: string | null): string {
  if (!brandName) return brandThemes.samsung;
  const key = brandName.toLowerCase().replace(/\s+/g, "") as BrandSlug;
  return brandThemes[key] ?? "#94A3B8";
}
