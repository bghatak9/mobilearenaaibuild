/**
 * @deprecated Prefer SSR lang/dir on <html> + SitePageTranslator for googtrans.
 * Kept as a no-op export so any stray imports do not inject React <script> tags.
 */
export function LanguageInitScript() {
  return null;
}
