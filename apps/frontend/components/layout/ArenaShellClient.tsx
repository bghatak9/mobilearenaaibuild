"use client";

import { Suspense } from "react";
import AdUnit, { StickyAdBar } from "@/components/ads/AdUnit";
import { FloatingNav } from "@/design-system/navigation/FloatingNav";
import { accentForPathname } from "@/design-system/titan-spectrum/category-accents";
import type { SiteAdSlots } from "@/lib/ad-utils";
import { hideMobileChrome } from "@/lib/mobile-routes";
import { usePathname } from "next/navigation";

type ArenaShellClientProps = {
  children: React.ReactNode;
  auth?: boolean;
  showAds?: boolean;
  slots?: SiteAdSlots;
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
}: ArenaShellClientProps) {
  const pathname = usePathname();
  const { topAd, stickyFooterAd } = slots;
  const minimalChrome = auth || hideMobileChrome(pathname);
  const routeAccent = accentForPathname(pathname);

  return (
    <div
      className="arena-theme min-h-screen min-h-[100dvh] overflow-x-clip bg-[var(--dark-space)] text-[var(--text-primary)]"
      data-titan-accent={routeAccent}
    >
      <div className="spectrum-page-bg aurora-page-bg fixed inset-0 -z-10" aria-hidden />

      {!minimalChrome ? (
        <Suspense fallback={null}>
          <FloatingNav />
        </Suspense>
      ) : null}

      <div
        className={
          auth
            ? "arena-shell-container arena-mobile-main-pad mx-auto w-full min-w-0 pb-8 sm:pb-10"
            : "arena-shell-container arena-mobile-main-pad arena-mobile-content-pad mx-auto w-full min-w-0 pb-8 sm:pb-10"
        }
      >
        {showAds && topAd ? (
          <section aria-label="Sponsored banner" className="mb-6">
            <AdUnit ad={topAd} />
          </section>
        ) : null}
        {children}
      </div>

      {showAds ? <StickyAdBar ad={stickyFooterAd} /> : null}
    </div>
  );
}
