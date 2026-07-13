import type { ResolvedSiteLanguage } from "@/features/i18n/languages";

import { DEFAULT_LOCALE, hasMessagePack, isCuratedMessageLocale } from "./locales";

/** @deprecated Prefer hasMessagePack / config messagePacks */
export const NATIVE_MESSAGE_LOCALES = ["en", "zh", "hi", "es", "zh-CN"] as const;

export type NativeMessageLocale = (typeof NATIVE_MESSAGE_LOCALES)[number];

export { DEFAULT_LOCALE };

export const LOCALE_COOKIE = "mobilearena_lang";

export function isNativeMessageLocale(code: string): boolean {
  return (
    isCuratedMessageLocale(code) ||
    hasMessagePack(code) ||
    code === "zh-CN" ||
    code === "zh-TW"
  );
}

export function messagesLocaleFor(
  code: string | null | undefined,
): ResolvedSiteLanguage {
  if (!code || code === "auto") return DEFAULT_LOCALE as ResolvedSiteLanguage;
  if (code === "zh-CN" || code === "zh-TW" || code === "zh") {
    return "zh" as ResolvedSiteLanguage;
  }
  if (code === "hi" || code === "es" || code === "en") {
    return code as ResolvedSiteLanguage;
  }
  return DEFAULT_LOCALE as ResolvedSiteLanguage;
}

/** Nest flat `nav.brands` keys into `{ nav: { brands } }` for next-intl. */
export function nestFlatMessages(
  flat: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let cur: Record<string, unknown> = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      const next = cur[part];
      if (!next || typeof next !== "object") {
        cur[part] = {};
      }
      cur = cur[part] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]!] = value;
  }
  return out;
}
