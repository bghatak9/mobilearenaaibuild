export {
  SITE_LANGUAGES,
  SITE_LANGUAGE_STORAGE_KEY,
  SITE_LANGUAGE_COOKIE,
  detectBrowserSiteLanguage,
  resolveSiteLanguage,
  getStoredSiteLanguage,
  setStoredSiteLanguage,
  applyDocumentLanguage,
  getSiteLanguage,
  getSiteLanguages,
  isSiteLanguageCode,
  parseSiteLanguageCookie,
  normalizeToAppLocale,
} from "./languages";
export type { SiteLanguageCode, ResolvedSiteLanguage, SiteLanguage } from "./languages";
export type { MessageKey, MessageCatalog } from "./messages";
export { EN_MESSAGES, getMessages, translateMessage } from "./messages";
export {
  googleTranslateCodeForSite,
  siteLanguageFromGoogleCode,
  includedGoogleLanguages,
  setPageTranslateCookie,
  applyGooglePageLanguage,
  pageLooksTranslated,
  commitPageLanguageAndReload,
  PAGE_TRANSLATE_SOURCE,
  PAGE_TRANSLATE_RELOAD_KEY,
} from "./page-translate";
export {
  localizeBrandName,
  resolveBrandLabel,
  isCuratedBrandTranslation,
  type BrandLabelResolution,
} from "./brand-names";
export { localizeDeviceName } from "./device-names";
export {
  localizeTechnicalText,
  resolveTechnicalText,
  localizeNumbersForZh,
  numberToChinese,
} from "./technical-text";
export type { TechnicalTextResolution } from "./technical-text";
export { localizeFieldLabel } from "./field-labels";
