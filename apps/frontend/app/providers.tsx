"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CatalogProvider } from "@/lib/catalog-context";
import { CompareProvider } from "@/lib/compare-context";
import { SiteAuthProvider } from "@/lib/site-auth";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/design-system/feedback/Toast";
import CompareBar from "@/components/compare/CompareBar";
import { MobileChromeSync } from "@/components/layout/MobileChromeSync";
import { PublicSiteChrome } from "@/components/layout/PublicSiteChrome";

function clearStuckBodyScrollLock() {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
}

export default function Providers({
  children,
  importedOnly = false,
}: {
  children: ReactNode;
  importedOnly?: boolean;
}) {
  const pathname = usePathname();

  useEffect(() => {
    clearStuckBodyScrollLock();
  }, [pathname]);

  useEffect(() => {
    clearStuckBodyScrollLock();
    return clearStuckBodyScrollLock;
  }, []);

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
