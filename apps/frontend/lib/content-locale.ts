/** Append `locale` to API query strings for CMS content localization. */
export function withLocaleQuery(
  path: string,
  locale?: string | null,
): string {
  if (!locale || !locale.trim()) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}locale=${encodeURIComponent(locale.trim())}`;
}
