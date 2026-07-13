"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CatalogProvider } from "@/lib/catalog-context";
import { CompareProvider } from "@/lib/compare-context";
import { SiteAuthProvider } from "@/lib/site-auth";
import { ThemeProvider } from "@/lib/theme";
import { SiteLanguageProvider } from "@/lib/site-language";
import { ToastProvider } from "@/design-system/feedback/Toast";
import { LanguageStatusAnnouncer } from "@/components/a11y/LanguageStatusAnnouncer";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import CompareBar from "@/components/compare/CompareBar";
import { MobileChromeSync } from "@/components/layout/MobileChromeSync";
import { PublicSiteChrome } from "@/components/layout/PublicSiteChrome";
import { SitePageTranslator } from "@/components/layout/SitePageTranslator";
import { catalogImportedOnlyFromEnv } from "@/lib/catalog-mode";
import { stripLocalePrefix } from "@/lib/locale-path";
import type { SiteLanguageCode } from "@/features/i18n";
import type { Theme } from "@/lib/theme";

function clearStuckBodyScrollLock() {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
}

export default function Providers({
  children,
  importedOnly = catalogImportedOnlyFromEnv(),
  initialLanguage = "en",
  initialTheme = "dark",
}: {
  children: ReactNode;
  importedOnly?: boolean;
  initialLanguage?: SiteLanguageCode;
  initialTheme?: Theme;
}) {
  const rawPathname = usePathname();
  const pathname = stripLocalePrefix(rawPathname);

  useEffect(() => {
    clearStuckBodyScrollLock();
  }, [pathname]);

  useEffect(() => {
    clearStuckBodyScrollLock();
    return clearStuckBodyScrollLock;
  }, []);

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <SiteLanguageProvider initialLanguage={initialLanguage}>
        <ToastProvider>
          <CatalogProvider importedOnly={importedOnly}>
            <SiteAuthProvider>
              <CompareProvider>
                <SkipToContent />
                <LanguageStatusAnnouncer />
                <MobileChromeSync />
                <PublicSiteChrome />
                <SitePageTranslator />
                {children}
                <CompareBar />
              </CompareProvider>
            </SiteAuthProvider>
          </CatalogProvider>
        </ToastProvider>
      </SiteLanguageProvider>
    </ThemeProvider>
  );
}
