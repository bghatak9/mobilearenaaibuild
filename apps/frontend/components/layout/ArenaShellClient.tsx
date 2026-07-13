"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { StickyAdBar } from "@/components/ads/AdUnit";
import { NativeCardAdBlock } from "@/components/ads/PageAdBlocks";
import { ArenaSiteFooter } from "@/components/home/arena/ArenaSiteFooter";
import { accentForPathname } from "@/design-system/titan-spectrum/category-accents";
import { cn } from "@/design-system/utils/cn";
import type { SiteAdSlots } from "@/lib/ad-utils";
import { hideMobileChrome, isAdFreeRoute, isAdminRoute } from "@/lib/mobile-routes";

type ArenaShellClientProps = {
  children: React.ReactNode;
  auth?: boolean;
  showAds?: boolean;
  slots?: SiteAdSlots;
  /** Renders after the native card slot (homepage newsletter / contact). */
  afterAds?: ReactNode;
};

const EMPTY_SLOTS: SiteAdSlots = {
  topAd: null,
  stickyFooterAd: null,
  nativeCardAd: null,
};

export function ArenaShellClient({
  children,
  auth = false,
  showAds = true,
  slots = EMPTY_SLOTS,
  afterAds,
}: ArenaShellClientProps) {
  const pathname = usePathname();
  const t = useTranslations("a11y");
  const { stickyFooterAd, nativeCardAd } = slots;
  const routeAccent = accentForPathname(pathname);
  const adsEnabled = showAds && !auth && !isAdFreeRoute(pathname);
  const hasTopAd = adsEnabled && !hideMobileChrome(pathname);
  const showSiteFooter = !auth && !isAdminRoute(pathname);

  return (
    <div
      className="arena-theme min-h-screen min-h-[100dvh] bg-[var(--dark-space)] text-[var(--text-primary)]"
      data-titan-accent={routeAccent}
    >
      <div className="spectrum-page-bg aurora-page-bg fixed inset-0 -z-10" aria-hidden />

      <div className="min-h-screen min-h-[100dvh] overflow-x-clip">
        <div
          className={cn(
            "arena-shell-container arena-mobile-main-pad w-full min-w-0 pb-8 sm:pb-10",
            !auth && "arena-mobile-content-pad",
            hasTopAd && "arena-mobile-main-pad--with-top-ad",
          )}
        >
          <main
            id="main-content"
            tabIndex={-1}
            aria-label={t("mainContent")}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-space)]"
          >
            {children}
          </main>
          {adsEnabled && nativeCardAd ? (
            <NativeCardAdBlock
              ad={nativeCardAd}
              className={pathname === "/" ? "arena-home-section" : "mt-10"}
            />
          ) : null}
          {afterAds}
          {showSiteFooter ? <ArenaSiteFooter /> : null}
        </div>

        {adsEnabled ? <StickyAdBar ad={stickyFooterAd} /> : null}
      </div>
    </div>
  );
}
