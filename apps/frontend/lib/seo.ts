import { getLocaleMeta } from "@/i18n/locales";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "MobileArena";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Build hreflang map for a path under each enabled locale.
 * `path` should be locale-stripped (e.g. `/news/foo` or `/phones/bar`).
 *
 * When `slugByLocale` is provided, the final path segment is replaced per
 * locale (falling back to English / the path slug). Keys use BCP-47 tags.
 */
export function localeAlternateLanguages(
  path: string,
  locales: readonly string[],
  slugByLocale?: Record<string, string>,
): Record<string, string> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const lastSlash = normalized.lastIndexOf("/");
  const dir = lastSlash > 0 ? normalized.slice(0, lastSlash) : "";
  const defaultSlug =
    lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized.replace(/^\//, "");
  const useSlugs = Boolean(slugByLocale && Object.keys(slugByLocale).length > 0);

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const bcp47 = getLocaleMeta(loc).bcp47 || loc;
    const slug = useSlugs
      ? (slugByLocale![loc] ??
        slugByLocale!.en ??
        defaultSlug)
      : defaultSlug;
    const suffix = useSlugs
      ? `${dir}/${slug}`
      : normalized;
    languages[bcp47] = absoluteUrl(`/${loc}${suffix === "/" ? "" : suffix}`);
  }
  const enSlug = useSlugs
    ? (slugByLocale!.en ?? defaultSlug)
    : defaultSlug;
  const enSuffix = useSlugs ? `${dir}/${enSlug}` : normalized;
  languages["x-default"] = absoluteUrl(
    `/en${enSuffix === "/" ? "" : enSuffix}`,
  );
  return languages;
}

/** Open Graph locale tag (underscore form, e.g. en_US). */
export function openGraphLocale(locale: string): string {
  return getLocaleMeta(locale).bcp47.replace(/-/g, "_");
}

/** Alternate Open Graph locales excluding the current one. */
export function openGraphAlternateLocales(
  currentLocale: string,
  locales: readonly string[],
): string[] {
  const current = openGraphLocale(currentLocale);
  const out: string[] = [];
  for (const loc of locales) {
    const tag = openGraphLocale(loc);
    if (tag !== current && !out.includes(tag)) out.push(tag);
  }
  return out;
}
