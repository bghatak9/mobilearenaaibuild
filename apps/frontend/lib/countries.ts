import { ISO_COUNTRIES, ISO_NAME_BY_CODE } from "@/lib/iso-countries";

/** ISO 3166-1 alpha-2 country catalogue for analytics UI. */
export const COUNTRY_CATALOG: { code: string; name: string }[] = [
  { code: "ALL", name: "All countries" },
  ...ISO_COUNTRIES,
];

export function countryName(code: string): string {
  return ISO_NAME_BY_CODE[code] ?? code;
}

/** Regional indicator emoji flag from ISO alpha-2. */
export function countryFlag(code: string): string {
  if (!code || code === "ALL" || code === "Unknown" || code.length !== 2) {
    return "🌐";
  }
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
}

export function mergeCountryOptions(
  fromData: { code: string; name: string }[],
): { code: string; name: string }[] {
  const seen = new Set<string>(["ALL"]);
  const merged: { code: string; name: string }[] = [COUNTRY_CATALOG[0]];

  for (const item of [...fromData, ...COUNTRY_CATALOG.slice(1)]) {
    if (seen.has(item.code)) continue;
    seen.add(item.code);
    merged.push({ code: item.code, name: item.name });
  }
  return merged;
}

export type DatePreset =
  | "today"
  | "7d"
  | "30d"
  | "month"
  | "year"
  | "all"
  | "custom";

export function presetToRange(preset: DatePreset): {
  from?: string;
  to?: string;
} {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  if (preset === "all") return {};
  if (preset === "today") return { from: fmt(now), to: fmt(now) };

  if (preset === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from: fmt(from), to: fmt(now) };
  }

  if (preset === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 29);
    return { from: fmt(from), to: fmt(now) };
  }

  if (preset === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: fmt(from), to: fmt(now) };
  }

  if (preset === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: fmt(from), to: fmt(now) };
  }

  return {};
}
