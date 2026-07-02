"use client";

import type { ReactNode } from "react";
import { CatalogProvider } from "@/lib/catalog-context";
import { CompareProvider } from "@/lib/compare-context";
import { SiteAuthProvider } from "@/lib/site-auth";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/design-system/feedback/Toast";
import CompareBar from "@/components/compare/CompareBar";
import { MobileChromeSync } from "@/components/layout/MobileChromeSync";
import { PublicSiteChrome } from "@/components/layout/PublicSiteChrome";

export default function Providers({
  children,
  importedOnly = false,
}: {
  children: ReactNode;
  importedOnly?: boolean;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CatalogProvider importedOnly={importedOnly}>
          <SiteAuthProvider>
            <CompareProvider>
              <MobileChromeSync />
              <PublicSiteChrome />
              {children}
              <CompareBar />
            </CompareProvider>
          </SiteAuthProvider>
        </CatalogProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
