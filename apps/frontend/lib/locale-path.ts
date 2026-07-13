/**
 * Helpers for paths that may include a locale prefix (`/en/phones` → `/phones`).
 */

import { isEnabledLocale, canonicalizeLocale } from "@/i18n/locales";

export function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === "/") return pathname || "/";
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  if (maybeLocale && isEnabledLocale(canonicalizeLocale(maybeLocale))) {
    // Also accept exact enabled segment (already canonical)
    if (isEnabledLocale(maybeLocale) || isEnabledLocale(canonicalizeLocale(maybeLocale))) {
      const rest = parts.slice(2).join("/");
      return rest ? `/${rest}` : "/";
    }
  }
  if (maybeLocale && isEnabledLocale(maybeLocale)) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

export function localeFromPathname(pathname: string): string | null {
  const maybeLocale = pathname.split("/")[1];
  if (!maybeLocale) return null;
  if (isEnabledLocale(maybeLocale)) return maybeLocale;
  const canonical = canonicalizeLocale(maybeLocale);
  return isEnabledLocale(canonical) ? canonical : null;
}
