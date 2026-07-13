/**
 * Config-driven locale registry.
 * Add locales by editing `config/i18n/locales.json` + dropping
 * `messages/{locale}/*.json` — no component code changes required.
 */

import localeConfig from "@/config/i18n/locales.json";

export type AppLocale = string;

export const DEFAULT_LOCALE: string = localeConfig.defaultLocale || "en";

export const LOCALE_COOKIE = "mobilearena_lang";

const ENABLED = localeConfig.enabled as string[];
const MESSAGE_PACKS = new Set(localeConfig.messagePacks as string[]);
const POPULAR = new Set(localeConfig.popular as string[]);
const RTL = new Set(localeConfig.rtl as string[]);
const REDIRECTS = localeConfig.redirects as Record<string, string>;
const NAMESPACES = localeConfig.namespaces as string[];

/** Enabled URL locales from config (source of truth for routing). */
export const ENABLED_LOCALES: readonly string[] = Object.freeze([...ENABLED]);

/** @deprecated Prefer ENABLED_LOCALES — kept for gradual migration */
export const UNIQUE_APP_LOCALES = ENABLED_LOCALES;

/** @deprecated Prefer ENABLED_LOCALES */
export const APP_LOCALES = ENABLED_LOCALES;

export const MESSAGE_NAMESPACES = NAMESPACES;

export type MessageNamespace = string;

export function getEnabledLocales(): readonly string[] {
  return ENABLED_LOCALES;
}

export function getMessagePackLocales(): readonly string[] {
  return localeConfig.messagePacks as string[];
}

export function getPopularLocales(): readonly string[] {
  return localeConfig.popular as string[];
}

export function getLocaleRedirects(): Record<string, string> {
  return { ...REDIRECTS };
}

/** Validate BCP-47-ish tags (language[-Script][-REGION]). */
export function isValidBcp47Tag(value: string): boolean {
  if (!value || value.length > 20) return false;
  try {
    // Throws on invalid tags in modern engines.
    // eslint-disable-next-line no-new
    new Intl.Locale(value);
    return /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(value);
  } catch {
    return false;
  }
}

export function isAppLocale(value: string): boolean {
  return ENABLED.includes(value);
}

export function isEnabledLocale(value: string): boolean {
  return isAppLocale(value);
}

export function hasMessagePack(locale: string): boolean {
  return MESSAGE_PACKS.has(locale);
}

export function isRtlLocale(locale: string): boolean {
  if (RTL.has(locale)) return true;
  const primary = locale.split("-")[0]?.toLowerCase() ?? "";
  return RTL.has(primary);
}

/** Locales with deeper curated packs (EN + priority markets). */
export function isCuratedMessageLocale(locale: string): boolean {
  return hasMessagePack(locale) || locale === "zh" || locale === "hi" || locale === "es";
}

export type LocaleMeta = {
  code: string;
  label: string;
  nativeLabel: string;
  bcp47: string;
  region?: string;
  rtl?: boolean;
  popular?: boolean;
};

function displayName(
  locale: string,
  of: string,
  fallback: string,
): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "language" });
    return dn.of(of) ?? fallback;
  } catch {
    return fallback;
  }
}

export function getLocaleMeta(locale: string): LocaleMeta {
  const code = canonicalizeLocale(locale) || locale;
  const english = displayName("en", code, code);
  const native = displayName(code, code, english);
  let region: string | undefined;
  try {
    const loc = new Intl.Locale(code);
    if (loc.region) {
      region =
        new Intl.DisplayNames(["en"], { type: "region" }).of(loc.region) ??
        loc.region;
    }
  } catch {
    /* ignore */
  }
  return {
    code,
    label: english,
    nativeLabel: native,
    bcp47: code,
    region,
    rtl: isRtlLocale(code),
    popular: POPULAR.has(code),
  };
}

/** Apply redirects + case normalization to a canonical enabled locale. */
export function canonicalizeLocale(raw: string | null | undefined): string {
  return matchEnabledLocale(raw) ?? DEFAULT_LOCALE;
}

/**
 * Map a BCP-47 tag to an enabled locale, or `null` if nothing matches.
 * Does not fall back to English (use canonicalizeLocale for that).
 */
export function matchEnabledLocale(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const tag = raw.trim().replace(/_/g, "-");
  if (!tag) return null;

  const lower = tag.toLowerCase();
  for (const enabled of ENABLED) {
    if (enabled.toLowerCase() === lower) return enabled;
  }

  for (const [from, to] of Object.entries(REDIRECTS)) {
    if (from.toLowerCase() === lower && isAppLocale(to)) return to;
  }

  const parts = tag.split("-");
  if (parts.length >= 2) {
    const lang = parts[0]!.toLowerCase();
    const normalized = [
      lang,
      ...parts.slice(1).map((p) =>
        p.length === 2
          ? p.toUpperCase()
          : p.length === 4
            ? p[0]!.toUpperCase() + p.slice(1).toLowerCase()
            : p,
      ),
    ].join("-");
    for (const enabled of ENABLED) {
      if (enabled.toLowerCase() === normalized.toLowerCase()) return enabled;
    }
    if (REDIRECTS[normalized] && isAppLocale(REDIRECTS[normalized]!)) {
      return REDIRECTS[normalized]!;
    }
    if (REDIRECTS[lang] && isAppLocale(REDIRECTS[lang]!)) {
      return REDIRECTS[lang]!;
    }
    // Prefer exact regional enabled locale over primary (fr-CA stays fr-CA).
    const byPrimary = ENABLED.find((l) => l.toLowerCase() === lang);
    if (byPrimary) return byPrimary;
  }

  const primary = parts[0]!.toLowerCase();
  if (REDIRECTS[primary] && isAppLocale(REDIRECTS[primary]!)) {
    return REDIRECTS[primary]!;
  }
  const byPrimary = ENABLED.find((l) => l.toLowerCase() === primary);
  if (byPrimary) return byPrimary;

  return null;
}

/**
 * Negotiate Accept-Language (with q-values) → best enabled locale.
 * Example: `bn-IN,en-US;q=0.9,hi;q=0.8` → `bn`.
 */
export function negotiateAcceptLanguage(
  header: string | null | undefined,
): string {
  if (!header || !header.trim()) return DEFAULT_LOCALE;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tagPart, ...params] = part.trim().split(";");
      const tag = tagPart?.trim() ?? "";
      let quality = 1;
      for (const p of params) {
        const m = /q\s*=\s*([0-9.]+)/i.exec(p);
        if (m) {
          const q = Number.parseFloat(m[1]!);
          if (Number.isFinite(q)) quality = q;
        }
      }
      return { tag, quality };
    })
    .filter((c) => c.tag && c.tag !== "*")
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    const matched = matchEnabledLocale(tag);
    if (matched) return matched;
  }

  return DEFAULT_LOCALE;
}

/** Negotiate Accept-Language / cookie / preference → enabled locale. */
export function negotiateAppLocale(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_LOCALE;
  // Full Accept-Language header or a single tag.
  if (raw.includes(",") || /;q=/i.test(raw)) {
    return negotiateAcceptLanguage(raw);
  }
  return canonicalizeLocale(raw.trim().split(";")[0]?.trim() ?? raw);
}

/** Resolve alias used in URL before routing (for proxy redirects). */
export function resolveLocaleRedirect(segment: string): string | null {
  if (!segment) return null;
  const matched = matchEnabledLocale(segment);
  if (!matched) return null;
  const lower = segment.replace(/_/g, "-");
  if (lower.toLowerCase() !== matched.toLowerCase()) {
    return matched;
  }
  return null;
}
