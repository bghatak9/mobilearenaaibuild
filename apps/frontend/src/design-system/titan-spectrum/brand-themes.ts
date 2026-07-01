/**
 * Titan Spectrum — subtle brand accent hints (never exact OEM branding).
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

export type BrandThemeKey = keyof typeof brandThemes;

export function brandAccent(slug: string): string | undefined {
  const key = slug.toLowerCase().replace(/[^a-z]/g, "") as BrandThemeKey;
  return brandThemes[key as BrandThemeKey];
}
