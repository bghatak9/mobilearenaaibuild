"use client";

import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import AdUnit from "@/components/ads/AdUnit";
import { FloatingNav } from "@/design-system/navigation/FloatingNav";
import { getActiveAdvertisements } from "@/lib/api";
import { bannerSlotMaxHeight, bannerStyleVars, resolveSiteAdSlots, type SiteAdSlots } from "@/lib/ad-utils";
import { hideMobileChrome, isAdFreeRoute } from "@/lib/mobile-routes";
import { stripLocalePrefix } from "@/lib/locale-path";

const EMPTY_SLOTS: SiteAdSlots = {
  topAd: null,
  stickyFooterAd: null,
  nativeCardAd: null,
};

/** Header + top ad persist across route changes so spacing never resets. */
export function PublicSiteChrome() {
  const rawPathname = usePathname();
  const pathname = stripLocalePrefix(rawPathname);
  const minimalChrome = hideMobileChrome(pathname);
  const showAds = !minimalChrome && !isAdFreeRoute(pathname);
  const [topAd, setTopAd] = useState(EMPTY_SLOTS.topAd);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    const spacer = document.getElementById("arena-chrome-spacer");
    if (spacer && document.body.firstChild !== spacer) {
      document.body.insertBefore(spacer, document.body.firstChild);
    }
    const topAdNode = document.getElementById("arena-top-ad-bar");
    if (topAdNode && spacer?.nextSibling !== topAdNode) {
      document.body.insertBefore(topAdNode, spacer?.nextSibling ?? null);
    }
  }, [topAd, portalReady, showAds]);

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
      const bannerH = bannerSlotMaxHeight(topAd, "header");
      html.style.setProperty("--arena-top-banner-h", `${bannerH}px`);
      html.style.setProperty(
        "--arena-chrome-bottom",
        `calc(7.5rem + ${bannerH}px)`,
      );
    } else {
      html.removeAttribute("data-has-top-ad");
      html.style.removeProperty("--arena-top-banner-h");
    }
  }, [showAds, topAd]);

  if (minimalChrome) return null;

  const chromeLayer = (
    <>
      <div
        id="arena-chrome-spacer"
        className="arena-chrome-spacer"
        aria-hidden
      />
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

  return (
    <>
      {portalReady ? createPortal(chromeLayer, document.body) : chromeLayer}

      <Suspense fallback={null}>
        <FloatingNav />
      </Suspense>
    </>
  );
}
