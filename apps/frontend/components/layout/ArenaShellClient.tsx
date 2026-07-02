"use client";

import { type ReactNode } from "react";
import { StickyAdBar } from "@/components/ads/AdUnit";
import { NativeCardAdBlock } from "@/components/ads/PageAdBlocks";
import { accentForPathname } from "@/design-system/titan-spectrum/category-accents";
import { cn } from "@/design-system/utils/cn";
import type { SiteAdSlots } from "@/lib/ad-utils";
import { hideMobileChrome, isAdFreeRoute } from "@/lib/mobile-routes";
import { usePathname } from "next/navigation";

type ArenaShellClientProps = {
  children: React.ReactNode;
  auth?: boolean;
  showAds?: boolean;
  slots?: SiteAdSlots;
  /** Renders after the native card slot (homepage newsletter / footer). */
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
  const { stickyFooterAd, nativeCardAd } = slots;
  const routeAccent = accentForPathname(pathname);
  const adsEnabled = showAds && !auth && !isAdFreeRoute(pathname);
  const hasTopAd = adsEnabled && !hideMobileChrome(pathname);

  return (
    <div
      className="arena-theme min-h-screen min-h-[100dvh] bg-[var(--dark-space)] text-[var(--text-primary)]"
      data-titan-accent={routeAccent}
    >
      <div className="spectrum-page-bg aurora-page-bg fixed inset-0 -z-10" aria-hidden />

      <div className="min-h-screen min-h-[100dvh] overflow-x-clip">
        <div
          className={cn(
            "arena-shell-container arena-mobile-main-pad mx-auto w-full min-w-0 pb-8 sm:pb-10",
            !auth && "arena-mobile-content-pad",
            hasTopAd && "arena-mobile-main-pad--with-top-ad",
          )}
        >
          {children}
          {adsEnabled && nativeCardAd ? (
            <NativeCardAdBlock
              ad={nativeCardAd}
              className={pathname === "/" ? "arena-home-section" : "mt-10"}
            />
          ) : null}
          {afterAds}
        </div>

        {adsEnabled ? <StickyAdBar ad={stickyFooterAd} /> : null}
      </div>
    </div>
  );
}
