"use client";

import type { PaidAdvertisement } from "@/lib/api";
import AdUnit, { StickyAdBar } from "@/components/ads/AdUnit";
import { FloatingNav } from "@/design-system/navigation/FloatingNav";
import { MobileBottomNav } from "@/design-system/navigation/MobileBottomNav";

type ArenaShellClientProps = {
  children: React.ReactNode;
  auth?: boolean;
  topAd?: PaidAdvertisement | null;
  stickyFooterAd?: PaidAdvertisement | null;
};

export function ArenaShellClient({
  children,
  auth = false,
  topAd = null,
  stickyFooterAd = null,
}: ArenaShellClientProps) {
  return (
    <div className="arena-theme min-h-screen bg-[var(--dark-space)] text-[var(--text-primary)]">
      <div className="aurora-page-bg fixed inset-0 -z-10" aria-hidden />
      <FloatingNav />
      <div
        className={
          auth
            ? "mx-auto w-full min-w-0 max-w-[1120px] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-24 sm:px-4 sm:pb-12 sm:pt-28 md:pt-32"
            : "mx-auto max-w-[1120px] px-4 pb-28 pt-36 md:pb-12 md:pt-40"
        }
      >
        {topAd ? (
          <section aria-label="Sponsored banner" className="mb-6">
            <AdUnit ad={topAd} variant="banner" />
          </section>
        ) : null}
        {children}
      </div>
      <StickyAdBar ad={stickyFooterAd} />
      <MobileBottomNav />
    </div>
  );
}
