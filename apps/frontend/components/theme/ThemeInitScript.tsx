/**
 * @deprecated Theme/language bootstrap no longer injects <script> tags
 * (React 19 / Next 16 forbid them in components). Theme is applied from
 * cookie in `app/layout.tsx`; googtrans sync lives in SitePageTranslator.
 */
export function ThemeInitScript() {
  return null;
}
