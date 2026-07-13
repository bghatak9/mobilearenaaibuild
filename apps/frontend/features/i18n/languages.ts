import {
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  canonicalizeLocale,
  getEnabledLocales,
  getLocaleMeta,
  getPopularLocales,
  isAppLocale,
  isEnabledLocale,
  isRtlLocale,
  negotiateAppLocale,
} from "@/i18n/locales";

/** Enabled locale code or legacy aliases. */
export type SiteLanguageCode = string;

export type ResolvedSiteLanguage = string;

export type SiteLanguage = {
  code: string;
  label: string;
  nativeLabel: string;
  bcp47: string;
  rtl?: boolean;
  region?: string;
  popular?: boolean;
};

/** Built from config — never hardcode locale arrays in UI components. */
export function getSiteLanguages(): SiteLanguage[] {
  return getEnabledLocales().map((code) => {
    const meta = getLocaleMeta(code);
    return {
      code,
      label: meta.label,
      nativeLabel: meta.nativeLabel,
      bcp47: meta.bcp47,
      rtl: meta.rtl || isRtlLocale(code),
      region: meta.region,
      popular: meta.popular ?? getPopularLocales().includes(code),
    };
  });
}

/** @deprecated Prefer getSiteLanguages() — snapshot for legacy imports */
export const SITE_LANGUAGES: SiteLanguage[] = [
  { code: "auto", label: "Auto", nativeLabel: "Auto", bcp47: "" },
  ...getSiteLanguages(),
];

export const SITE_LANGUAGE_STORAGE_KEY = "mobilearena:site-language";
export const SITE_LANGUAGE_COOKIE = "mobilearena_lang";

export function normalizeToAppLocale(value: string): string {
  if (!value || value === "auto") return DEFAULT_LOCALE;
  return canonicalizeLocale(value);
}

export function isSiteLanguageCode(value: string): boolean {
  if (value === "auto" || value === "tl") return true;
  return isEnabledLocale(canonicalizeLocale(value)) || isAppLocale(value);
}

export function parseSiteLanguageCookie(
  raw: string | undefined | null,
): string | null {
  if (!raw) return null;
  const code = raw.trim();
  if (!code || code === "auto") return null;
  const canonical = canonicalizeLocale(code);
  return isEnabledLocale(canonical) ? canonical : null;
}

export function getSiteLanguage(code: string): SiteLanguage {
  const resolved = normalizeToAppLocale(code);
  return (
    getSiteLanguages().find((l) => l.code === resolved) ?? {
      code: DEFAULT_LOCALE,
      label: "English",
      nativeLabel: "English",
      bcp47: "en",
    }
  );
}

export function detectBrowserSiteLanguage(): string {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  return negotiateAppLocale(navigator.language || DEFAULT_LOCALE);
}

export function resolveSiteLanguage(code: string): string {
  if (code === "auto") return detectBrowserSiteLanguage();
  return normalizeToAppLocale(code);
}

export function getStoredSiteLanguage(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);
    if (raw && isSiteLanguageCode(raw)) {
      return raw === "auto" ? DEFAULT_LOCALE : normalizeToAppLocale(raw);
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function writeSiteLanguageCookie(code: string): void {
  if (typeof document === "undefined") return;
  const value = normalizeToAppLocale(code);
  document.cookie = `${SITE_LANGUAGE_COOKIE}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

export function setStoredSiteLanguage(code: string): void {
  if (typeof window === "undefined") return;
  try {
    const value = normalizeToAppLocale(code);
    localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, value);
    writeSiteLanguageCookie(value);
    window.dispatchEvent(new CustomEvent("site-language-change", { detail: value }));
  } catch {
    /* ignore */
  }
}

export function applyDocumentLanguage(code: string): void {
  if (typeof document === "undefined") return;
  const resolved = resolveSiteLanguage(code);
  const meta = getSiteLanguage(resolved);
  document.documentElement.lang = meta.bcp47 || resolved;
  document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  document.documentElement.setAttribute("data-site-lang", resolved);
  document.documentElement.setAttribute("translate", "yes");
}

export const LEGACY_SITE_LOCALE_CODES = ENABLED_LOCALES;
