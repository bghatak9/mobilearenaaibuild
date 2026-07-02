"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import AdUnit from "@/components/ads/AdUnit";
import { FloatingNav } from "@/design-system/navigation/FloatingNav";
import { getActiveAdvertisements } from "@/lib/api";
import { bannerSlotMaxHeight, bannerStyleVars, resolveSiteAdSlots, type SiteAdSlots } from "@/lib/ad-utils";
import { hideMobileChrome, isAdFreeRoute } from "@/lib/mobile-routes";

const EMPTY_SLOTS: SiteAdSlots = {
  topAd: null,
  stickyFooterAd: null,
  nativeCardAd: null,
};

/** Header + top ad persist across route changes so spacing never resets. */
export function PublicSiteChrome() {
  const pathname = usePathname();
  const minimalChrome = hideMobileChrome(pathname);
  const showAds = !minimalChrome && !isAdFreeRoute(pathname);
  const [topAd, setTopAd] = useState(EMPTY_SLOTS.topAd);

  useEffect(() => {
    if (!showAds) {
      setTopAd(null);
      return;
    }
    let active = true;
    void getActiveAdvertisements()
      .then((ads) => {
        if (!active) return;
        setTopAd(resolveSiteAdSlots(ads).topAd);
      })
      .catch(() => {
        if (active) setTopAd(null);
      });
    return () => {
      active = false;
    };
  }, [showAds]);

  useEffect(() => {
    const html = document.documentElement;
    if (showAds && topAd) {
      html.setAttribute("data-has-top-ad", "true");
      html.style.setProperty(
        "--arena-top-banner-h",
        `${bannerSlotMaxHeight(topAd, "header")}px`,
      );
    } else {
      html.removeAttribute("data-has-top-ad");
      html.style.removeProperty("--arena-top-banner-h");
    }
  }, [showAds, topAd]);

  if (minimalChrome) return null;

  return (
    <>
      <Suspense fallback={null}>
        <FloatingNav />
      </Suspense>

      {showAds && topAd ? (
        <section
          id="arena-top-ad-bar"
          className="arena-top-ad-bar"
          aria-label="Sponsored banner"
          style={bannerStyleVars(topAd, "header")}
        >
          <div className="arena-top-ad-bar-inner">
            <AdUnit ad={topAd} variant="banner" slot="header" />
          </div>
        </section>
      ) : null}
    </>
  );
}
