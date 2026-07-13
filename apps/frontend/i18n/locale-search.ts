/**
 * Locale picker search — matches code, English/native labels, region,
 * and curated aliases (e.g. "ban" → bn, "chi" → zh-CN).
 * Aliases live in config so new languages need no component changes.
 */

import aliases from "@/config/i18n/locale-search-aliases.json";
import type { SiteLanguage } from "@/features/i18n/languages";

const ALIAS_MAP = aliases as Record<string, string[]>;

function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Codes matched by alias keys that contain / start with the query. */
export function localeCodesForSearchQuery(query: string): Set<string> {
  const q = normalizeQuery(query);
  const out = new Set<string>();
  if (!q) return out;

  for (const [alias, codes] of Object.entries(ALIAS_MAP)) {
    const a = normalizeQuery(alias);
    if (a.includes(q) || q.includes(a)) {
      for (const code of codes) out.add(code);
    }
  }
  return out;
}

export function matchesLocaleSearch(
  entry: SiteLanguage,
  query: string,
): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;

  const aliasHits = localeCodesForSearchQuery(q);
  if (aliasHits.has(entry.code)) return true;

  const hay = normalizeQuery(
    [
      entry.code,
      entry.label,
      entry.nativeLabel,
      entry.region ?? "",
      entry.bcp47,
    ].join(" "),
  );

  if (hay.includes(q)) return true;

  // Prefix match on code segments: "zh" → zh-CN, zh-TW
  const codeNorm = normalizeQuery(entry.code);
  if (codeNorm.startsWith(q) || codeNorm.split("-").some((p) => p.startsWith(q))) {
    return true;
  }

  return false;
}
