import {
  resolveSiteLanguage,
  type ResolvedSiteLanguage,
  type SiteLanguageCode,
} from "./languages";

/** Google Translate language codes (differs for a few locales). */
const GOOGLE_LANG: Record<string, string> = {
  en: "en",
  zh: "zh-CN",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  hi: "hi",
  es: "es",
  fr: "fr",
  ar: "ar",
  bn: "bn",
  pt: "pt",
  "pt-PT": "pt",
  "pt-BR": "pt",
  "fr-CA": "fr",
  "es-MX": "es",
  "en-US": "en",
  "en-GB": "en",
  ru: "ru",
  ur: "ur",
  id: "id",
  de: "de",
  ja: "ja",
  sw: "sw",
  mr: "mr",
  te: "te",
  tr: "tr",
  ta: "ta",
  vi: "vi",
  ko: "ko",
  it: "it",
  th: "th",
  gu: "gu",
  kn: "kn",
  ml: "ml",
  fa: "fa",
  pl: "pl",
  uk: "uk",
  nl: "nl",
  el: "el",
  he: "iw",
  ms: "ms",
  fil: "tl",
  tl: "tl",
  sv: "sv",
  ro: "ro",
  hu: "hu",
  cs: "cs",
  da: "da",
  fi: "fi",
  no: "no",
  sk: "sk",
  bg: "bg",
  hr: "hr",
  sr: "sr",
  lt: "lt",
  lv: "lv",
  et: "et",
  pa: "pa",
  as: "as",
  or: "or",
  ne: "ne",
  si: "si",
  my: "my",
  km: "km",
  lo: "lo",
  mn: "mn",
  af: "af",
  am: "am",
  yo: "yo",
  ha: "ha",
  zu: "zu",
  xh: "xh",
  is: "is",
  sl: "sl",
  ca: "ca",
  ig: "ig",
};

export const PAGE_TRANSLATE_SOURCE = "en";
export const PAGE_TRANSLATE_RELOAD_KEY = "mobilearena:pending-page-lang";

export function googleTranslateCodeForSite(code: SiteLanguageCode): string {
  const resolved = resolveSiteLanguage(code);
  return GOOGLE_LANG[resolved] ?? "en";
}

/** Map Google Translate select values (e.g. zh-CN, iw) back to site language codes. */
export function siteLanguageFromGoogleCode(
  googleCode: string,
): SiteLanguageCode | null {
  const raw = googleCode.trim();
  if (!raw || raw === "auto") return null;
  if (raw === PAGE_TRANSLATE_SOURCE) return "en";
  if (raw === "zh-CN" || raw === "zh-TW" || raw === "zh") return "zh";
  if (raw === "iw" || raw === "he") return "he";
  const direct = Object.entries(GOOGLE_LANG).find(([, g]) => g === raw);
  if (direct) return direct[0] as ResolvedSiteLanguage;
  const prefix = raw.slice(0, 2);
  if (prefix in GOOGLE_LANG) return prefix as ResolvedSiteLanguage;
  return null;
}

export function includedGoogleLanguages(): string {
  return [...new Set(Object.values(GOOGLE_LANG))].join(",");
}

function writeCookie(name: string, value: string, domain?: string): void {
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax${domainPart}`;
}

function clearCookie(name: string, domain?: string): void {
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainPart}`;
}

/** Clear / set googtrans so Google Translate applies site-wide. */
export function setPageTranslateCookie(targetLang: string): void {
  if (typeof document === "undefined") return;

  const shouldReset =
    !targetLang || targetLang === PAGE_TRANSLATE_SOURCE || targetLang === "auto";
  // Empty clears translation; never write domain=IP (browsers reject it).
  const value = shouldReset ? "" : `/${PAGE_TRANSLATE_SOURCE}/${targetLang}`;

  const host = window.location.hostname;
  const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host);
  const domains: Array<string | undefined> = [undefined];
  if (host === "localhost" || host.endsWith(".localhost")) {
    domains.push("localhost", ".localhost");
  } else if (!isIp) {
    domains.push(host, `.${host}`);
  }

  for (const domain of domains) {
    clearCookie("googtrans", domain);
  }
  if (value) {
    // Prefer host-only cookie (no Domain=) — most reliable for GT.
    writeCookie("googtrans", value);
  }
}

export function findGoogleTranslateSelect(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>("select.goog-te-combo");
}

export function pageLooksTranslated(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  const body = document.body;
  return Boolean(
    root.classList.contains("translated-ltr") ||
      root.classList.contains("translated-rtl") ||
      body?.classList.contains("translated-ltr") ||
      body?.classList.contains("translated-rtl"),
  );
}

let applyingGoogleLanguage = false;

export function isApplyingGoogleLanguage(): boolean {
  return applyingGoogleLanguage;
}

function fireSelectChange(select: HTMLSelectElement, value: string): void {
  applyingGoogleLanguage = true;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  select.dispatchEvent(new Event("input", { bubbles: true }));
  // Keep the flag long enough to cover en→target bounce timers.
  window.setTimeout(() => {
    applyingGoogleLanguage = false;
  }, 120);
}

/** Apply whole-page translation via Google Translate widget select. */
export function applyGooglePageLanguage(
  targetLang: string,
  options?: { force?: boolean },
): boolean {
  const next =
    !targetLang || targetLang === PAGE_TRANSLATE_SOURCE
      ? PAGE_TRANSLATE_SOURCE
      : targetLang;

  setPageTranslateCookie(next);

  const select = findGoogleTranslateSelect();
  if (!select) return false;

  // English = empty combo value on some GT builds.
  const option =
    next === PAGE_TRANSLATE_SOURCE
      ? Array.from(select.options).find((o) => o.value === "" || o.value === "en")
      : Array.from(select.options).find((o) => o.value === next);
  if (!option && next !== PAGE_TRANSLATE_SOURCE) return false;

  const resolvedValue =
    next === PAGE_TRANSLATE_SOURCE ? (option?.value ?? "") : next;

  // Already on target
  if (select.value === resolvedValue || (next === PAGE_TRANSLATE_SOURCE && !select.value)) {
    if (options?.force && next !== PAGE_TRANSLATE_SOURCE) {
      fireSelectChange(select, PAGE_TRANSLATE_SOURCE === "en" ? "" : PAGE_TRANSLATE_SOURCE);
      window.setTimeout(() => fireSelectChange(select, next), 80);
    }
    return true;
  }

  const prev = select.value;
  // Switching between two non-English langs needs a brief English reset,
  // otherwise Google Translate leaves the previous language's text behind.
  if (
    prev &&
    prev !== PAGE_TRANSLATE_SOURCE &&
    prev !== "" &&
    next !== PAGE_TRANSLATE_SOURCE &&
    prev !== next
  ) {
    fireSelectChange(select, "");
    window.setTimeout(() => fireSelectChange(select, next), 80);
    return true;
  }

  void options;
  fireSelectChange(select, resolvedValue);
  return true;
}

/** Persist preferred page language and reload so Google Translate applies site-wide. */
export function commitPageLanguageAndReload(targetLang: string): void {
  const next =
    !targetLang || targetLang === PAGE_TRANSLATE_SOURCE
      ? PAGE_TRANSLATE_SOURCE
      : targetLang;

  setPageTranslateCookie(next);
  try {
    sessionStorage.setItem(PAGE_TRANSLATE_RELOAD_KEY, next);
  } catch {
    /* ignore */
  }

  // Drop GT hash without relying on navigation.
  if (window.location.hash) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }

  // Cache-bust query — same-document href assign is a no-op in Chromium.
  const url = new URL(window.location.href);
  url.searchParams.set("ma_tl", next);
  url.searchParams.set("_", String(Date.now()));

  // Prefer assign; fall back to reload if navigation is blocked.
  try {
    window.location.assign(url.toString());
  } catch {
    window.location.href = url.toString();
  }
  window.setTimeout(() => {
    if (new URL(window.location.href).searchParams.get("ma_tl") === next) return;
    window.location.reload();
  }, 250);
}

/** Strip the temporary ma_tl cache-bust param after language reload. */
export function clearPageLanguageReloadParam(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  let changed = false;
  if (url.searchParams.has("ma_tl")) {
    url.searchParams.delete("ma_tl");
    changed = true;
  }
  if (url.searchParams.has("_")) {
    url.searchParams.delete("_");
    changed = true;
  }
  if (!changed) return;
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, "", next || url.pathname);
}
