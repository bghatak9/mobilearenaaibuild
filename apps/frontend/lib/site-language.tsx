"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  applyDocumentLanguage,
  getStoredSiteLanguage,
  isSiteLanguageCode,
  normalizeToAppLocale,
  resolveSiteLanguage,
  setStoredSiteLanguage,
  type MessageKey,
  type ResolvedSiteLanguage,
  type SiteLanguageCode,
  translateMessage,
} from "@/features/i18n";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  SEARCH_LANGUAGES,
  setStoredSearchLanguage,
  type SearchLanguageCode,
} from "@/features/phone-finder/search-locale";
import { useClientMounted } from "@/hooks/useClientMounted";
import {
  googleTranslateCodeForSite,
  setPageTranslateCookie,
} from "@/features/i18n/page-translate";

type SiteLanguageContextValue = {
  language: SiteLanguageCode;
  resolved: ResolvedSiteLanguage;
  setLanguage: (code: SiteLanguageCode) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  ready: boolean;
};

const SiteLanguageContext = createContext<SiteLanguageContextValue | null>(null);

function syncSearchLanguage(code: SiteLanguageCode) {
  const resolved = resolveSiteLanguage(code);
  const supported = SEARCH_LANGUAGES.some((l) => l.code === resolved);
  if (supported) {
    setStoredSearchLanguage(resolved as SearchLanguageCode);
  }
}

function normalizeLanguage(code: SiteLanguageCode | string | null | undefined): SiteLanguageCode {
  if (!code || !isSiteLanguageCode(code) || code === "auto") return "en";
  return normalizeToAppLocale(code);
}

export function SiteLanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: SiteLanguageCode;
}) {
  const mounted = useClientMounted();
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();
  const [, startTransition] = useTransition();
  const intl = useTranslations();
  const [language, setLanguageState] = useState<SiteLanguageCode>(() =>
    normalizeLanguage(initialLanguage),
  );

  useEffect(() => {
    const fromUrl = normalizeLanguage(activeLocale);
    setLanguageState(fromUrl);
    applyDocumentLanguage(fromUrl);
    setStoredSiteLanguage(fromUrl);
  }, [activeLocale]);

  useEffect(() => {
    if (!mounted) return;
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SiteLanguageCode>).detail;
      const value = normalizeLanguage(detail ?? getStoredSiteLanguage());
      setLanguageState(value);
      applyDocumentLanguage(value);
    };
    window.addEventListener("site-language-change", onChange);
    return () => window.removeEventListener("site-language-change", onChange);
  }, [mounted]);

  const setLanguage = useCallback(
    (code: SiteLanguageCode) => {
      const next = normalizeLanguage(code);
      const prev = normalizeLanguage(activeLocale);
      if (prev === next) return;

      setStoredSiteLanguage(next);
      setLanguageState(next);
      applyDocumentLanguage(next);
      syncSearchLanguage(next);

      // Drive Google Translate site-wide for non-English (body + hard-coded UI).
      // next-intl still owns nav/footer chrome (protected from GT).
      setPageTranslateCookie(googleTranslateCodeForSite(next));

      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const hash = typeof window !== "undefined" ? window.location.hash : "";

      // Soft navigate: /en/news/... → /bn/news/... (preserves path + query).
      // Content APIs use the new locale via page params / getLocale().
      startTransition(() => {
        router.replace(`${pathname}${search}${hash}`, { locale: next });
      });
    },
    [activeLocale, pathname, router],
  );

  const resolved = resolveSiteLanguage(language);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      try {
        const value = vars
          ? intl(key, vars as Record<string, string | number | Date>)
          : intl(key);
        if (value && value !== key) return value;
      } catch {
        // Fall through to English catalog bridge.
      }
      return translateMessage(resolved, key, vars);
    },
    [intl, resolved],
  );

  const value = useMemo(
    () => ({
      language,
      resolved,
      setLanguage,
      t,
      ready: mounted,
    }),
    [language, mounted, resolved, setLanguage, t],
  );

  return (
    <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>
  );
}

export function useSiteLanguage(): SiteLanguageContextValue {
  const ctx = useContext(SiteLanguageContext);
  if (!ctx) {
    throw new Error("useSiteLanguage must be used within a SiteLanguageProvider");
  }
  return ctx;
}
