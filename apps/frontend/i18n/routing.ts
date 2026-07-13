import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, ENABLED_LOCALES, LOCALE_COOKIE } from "./locales";

export const LOCALE_COOKIE_NAME = LOCALE_COOKIE;

export const routing = defineRouting({
  locales: [...ENABLED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // First visit (no cookie): negotiate Accept-Language → best enabled locale.
  // After the user picks a language (or lands on an explicit /{locale} URL),
  // the mobilearena_lang cookie wins and auto-detect does not override it.
  localeDetection: true,
  alternateLinks: true,
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  },
});
