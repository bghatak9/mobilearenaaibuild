"use client";

import { useEffect, useRef } from "react";

import { useCompare } from "@/lib/compare-context";
import {
  COMPACT_HEADER_MEDIA_QUERY,
  DESKTOP_NAV_MEDIA_QUERY,
} from "@/lib/mobile-breakpoint";

const CHROME_IDS = [
  "arena-compare-bar",
  "arena-site-header",
  "arena-top-ad-bar",
  "arena-sticky-ad-bar",
] as const;

const CHROME_GAP_PX = 0;
const DESKTOP_CONTENT_GAP_PX = 0;
const HIDDEN_HEADER_OFFSET_PX = 8;
const HEADER_SELECTOR = "#arena-site-header";
const NAV_ANCHOR_SELECTOR =
  "#arena-site-header .arena-desktop-site-header, #arena-site-header .arena-mobile-site-header, #arena-site-header .arena-mobile-category-nav";
const HEADER_TRANSITION_MS = 320;
const NAV_PIN_MS = 1200;
const DESKTOP_HEADER_MIN_PX = 152;
/** Logo row + category nav + safe-area — never go below this when a top ad is present. */
const COMPACT_HEADER_MIN_PX = 152;

/** Layout height — immune to scroll position and transform glitches on Android Chrome. */
function measureChromeBlockHeight(node: HTMLElement): number {
  return Math.max(0, Math.ceil(node.offsetHeight));
}

function measureExpandedHeaderHeight(
  header: HTMLElement | null,
  desktopNav: boolean,
): number {
  if (!header) return 0;

  if (desktopNav) {
    const nav =
      header.querySelector<HTMLElement>(".arena-desktop-site-header") ??
      header.querySelector<HTMLElement>(".arena-floating-nav");
    if (nav) return measureChromeBlockHeight(nav);
  } else {
    const mobileShell = header.querySelector<HTMLElement>(".arena-mobile-site-header");
    if (mobileShell) return measureChromeBlockHeight(mobileShell);
  }

  return measureChromeBlockHeight(header);
}

function isTopChromeVisible(): boolean {
  const html = document.documentElement;
  return (
    !html.hasAttribute("data-site-header-hidden") ||
    html.hasAttribute("data-header-pinned") ||
    html.hasAttribute("data-header-interacting") ||
    html.hasAttribute("data-header-hovered")
  );
}

function measureLiveChromeBottom(
  header: HTMLElement | null,
  topAd: HTMLElement | null,
  topAdH: number,
  desktopNav: boolean,
): number {
  if (!header || !topAd || topAdH <= 0 || !isTopChromeVisible()) return 0;

  const adBottom = Math.ceil(topAd.getBoundingClientRect().bottom);
  let headerBottom = 0;

  if (desktopNav) {
    const nav =
      header.querySelector<HTMLElement>(".arena-desktop-site-header") ??
      header.querySelector<HTMLElement>(".arena-floating-nav");
    headerBottom = nav ? Math.ceil(nav.getBoundingClientRect().bottom) : 0;
  } else {
    const shell = header.querySelector<HTMLElement>(".arena-mobile-site-header");
    headerBottom = shell ? Math.ceil(shell.getBoundingClientRect().bottom) : 0;
  }

  const fromHeader = headerBottom > 48 ? headerBottom + topAdH : 0;
  const fromAd = adBottom > 48 ? adBottom : 0;

  return Math.max(fromHeader, fromAd);
}

/** Keep spacer before page content — required for Android Chrome document flow. */
function ensureChromeDomOrder() {
  const spacer = document.getElementById("arena-chrome-spacer");
  if (!spacer || document.body.firstChild === spacer) return;
  document.body.insertBefore(spacer, document.body.firstChild);

  const topAd = document.getElementById("arena-top-ad-bar");
  if (topAd && topAd.previousSibling !== spacer) {
    document.body.insertBefore(topAd, spacer.nextSibling);
  }
}

function syncChromeSpacer() {
  // Content offset uses .arena-mobile-main-pad padding — spacer stays collapsed.
  const spacer = document.getElementById("arena-chrome-spacer");
  if (spacer) {
    spacer.style.removeProperty("height");
  }
}

function isHeaderTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  return Boolean((target as Element).closest?.(HEADER_SELECTOR));
}

/** Measure fixed chrome and publish spacing vars so ads never overlap content. */
export function MobileChromeSync() {
  const { items } = useCompare();
  const expandedHeaderBottomRef = useRef(0);
  const headerInteractionUntilRef = useRef(0);

  useEffect(() => {
    const html = document.documentElement;
    let frame = 0;
    let transitionTimer = 0;

    const updateExpandedHeaderCache = (
      header: HTMLElement | null,
      desktopNav: boolean,
    ) => {
      if (!header) return;

      const measured = measureExpandedHeaderHeight(header, desktopNav);
      if (measured > 48) {
        expandedHeaderBottomRef.current = Math.max(
          expandedHeaderBottomRef.current,
          measured,
        );
      }
    };

    const applyFixedTopAdSpacing = (
      header: HTMLElement | null,
      topAd: HTMLElement | null,
      topAdH: number,
      desktopNav: boolean,
    ) => {
      updateExpandedHeaderCache(header, desktopNav);

      const floor = desktopNav ? DESKTOP_HEADER_MIN_PX : COMPACT_HEADER_MIN_PX;
      const cached = expandedHeaderBottomRef.current;
      let headerBottom = Math.max(cached > 48 ? cached : 0, floor);
      const calculatedChrome = headerBottom + topAdH;
      const liveChrome = measureLiveChromeBottom(header, topAd, topAdH, desktopNav);
      let chromeBottom =
        liveChrome > 0 ? Math.max(calculatedChrome, liveChrome) : calculatedChrome;

      if (liveChrome > calculatedChrome && topAdH > 0) {
        const liveHeaderBottom = liveChrome - topAdH;
        if (liveHeaderBottom > headerBottom) {
          expandedHeaderBottomRef.current = Math.max(
            expandedHeaderBottomRef.current,
            liveHeaderBottom,
          );
          headerBottom = liveHeaderBottom;
        }
      }

      chromeBottom = Math.max(chromeBottom, headerBottom + topAdH);

      html.style.setProperty("--arena-header-offset", `${headerBottom}px`);
      html.style.setProperty("--arena-top-ad-top", `${headerBottom}px`);
      html.style.setProperty("--arena-mobile-header-h", `${headerBottom}px`);
      html.style.setProperty("--arena-chrome-bottom", `${chromeBottom}px`);
      html.style.setProperty("--arena-content-top-pad", `${chromeBottom}px`);
      syncChromeSpacer();
      applyChromeReady(true);
      if (desktopNav) {
        html.style.setProperty("--arena-desktop-header-h", `${headerBottom}px`);
      } else {
        html.style.setProperty("--arena-desktop-header-h", "9.5rem");
      }
    };

    const applyExpandedCompactChrome = (
      header: HTMLElement | null,
      topAd: HTMLElement | null,
    ) => {
      const topAdH = readTopAdHeight(topAd);

      if (topAdH > 0) {
        html.style.setProperty("--arena-top-ad-h", `${topAdH}px`);
        html.style.setProperty("--arena-top-banner-h", `${topAdH}px`);
        html.setAttribute("data-has-top-ad", "true");
      }

      applyFixedTopAdSpacing(header, topAd, topAdH, false);
    };

    const pinHeaderChrome = (durationMs = NAV_PIN_MS) => {
      headerInteractionUntilRef.current = Date.now() + durationMs;
      html.removeAttribute("data-site-header-hidden");
      applyChromeReady(false);

      const compactHeader = window.matchMedia(COMPACT_HEADER_MEDIA_QUERY).matches;
      const desktopNav = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY).matches;
      const header = document.getElementById("arena-site-header");
      const topAd = document.getElementById("arena-top-ad-bar");
      const scrollY = readScrollY();

      if (scrollY > 56) {
        html.setAttribute("data-ad-suppressed-on-pin", "true");
      } else {
        html.removeAttribute("data-ad-suppressed-on-pin");
      }

      const pinSpacing = () => {
        if (!topAd) return;
        const topAdH = readTopAdHeight(topAd);
        if (topAdH <= 0) return;
        applyFixedTopAdSpacing(header, topAd, topAdH, desktopNav);
      };

      // Apply spacing BEFORE revealing the ad via data-header-pinned.
      pinSpacing();
      html.setAttribute("data-header-pinned", "true");
      html.setAttribute("data-header-interacting", "true");

      requestAnimationFrame(() => {
        pinSpacing();
        requestAnimationFrame(() => {
          pinSpacing();
          applyChromeReady(true);
        });
      });

      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        html.removeAttribute("data-header-pinned");
        html.removeAttribute("data-header-interacting");
        html.removeAttribute("data-ad-suppressed-on-pin");
        schedule();
      }, durationMs);
      schedule();
      scheduleAfterHeaderTransition();
      window.setTimeout(schedule, 50);
      window.setTimeout(schedule, HEADER_TRANSITION_MS);
      window.setTimeout(schedule, durationMs);
    };

    const measureNavAnchorBottom = (header: HTMLElement | null): number => {
      if (!header) return 0;
      const anchor = header.querySelector<HTMLElement>(NAV_ANCHOR_SELECTOR);
      if (anchor) {
        const bottom = Math.round(anchor.getBoundingClientRect().bottom);
        if (bottom > 48) return bottom;
      }
      return Math.round(header.getBoundingClientRect().bottom);
    };

    const measureHeaderBottomLive = (header: HTMLElement | null): number => {
      if (!header) return expandedHeaderBottomRef.current;
      const measured = Math.max(0, Math.ceil(header.getBoundingClientRect().bottom));
      if (measured > 48) {
        expandedHeaderBottomRef.current = Math.max(
          expandedHeaderBottomRef.current,
          measured,
        );
        return expandedHeaderBottomRef.current;
      }
      return expandedHeaderBottomRef.current;
    };

    const readBannerDesignHeight = (topAd: HTMLElement | null): number => {
      if (!topAd) return 0;
      const raw = getComputedStyle(topAd).getPropertyValue("--arena-top-banner-h").trim();
      const parsed = Number.parseFloat(raw);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    };

    const readTopAdHeight = (topAd: HTMLElement | null): number => {
      const fromAd = readBannerDesignHeight(topAd);
      const fromHtml = Number.parseFloat(
        getComputedStyle(html).getPropertyValue("--arena-top-banner-h").trim(),
      );
      const fromHtmlValid = Number.isFinite(fromHtml) && fromHtml > 0 ? fromHtml : 0;
      const measured = topAd
        ? Math.max(0, Math.ceil(topAd.getBoundingClientRect().height))
        : 0;
      return Math.max(fromAd, fromHtmlValid, measured);
    };

    const readScrollY = (): number => {
      const el = document.scrollingElement ?? document.documentElement;
      return Math.max(0, el.scrollTop || window.scrollY || 0);
    };

    const applyChromeReady = (ready: boolean) => {
      if (ready) {
        html.setAttribute("data-chrome-ready", "true");
      } else {
        html.removeAttribute("data-chrome-ready");
      }
    };

    const measureHeaderBottomSafe = (
      header: HTMLElement | null,
      headerHidden: boolean,
      desktopNav: boolean,
      forceMeasure: boolean,
    ): number => {
      const floor = desktopNav ? DESKTOP_HEADER_MIN_PX : COMPACT_HEADER_MIN_PX;

      if (!header) {
        return Math.max(expandedHeaderBottomRef.current, floor);
      }

      if (forceMeasure || !headerHidden) {
        const live = measureExpandedHeaderHeight(header, desktopNav);
        if (live > 48) {
          expandedHeaderBottomRef.current = Math.max(
            expandedHeaderBottomRef.current,
            live,
          );
          return Math.max(live, floor);
        }
      }

      return Math.max(expandedHeaderBottomRef.current, floor);
    };

    const measure = () => {
      ensureChromeDomOrder();
      const compactHeader = window.matchMedia(COMPACT_HEADER_MEDIA_QUERY).matches;
      const desktopNav = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY).matches;
      const headerPinned = html.hasAttribute("data-header-pinned");
      const headerInteracting = html.hasAttribute("data-header-interacting");
      const headerHovered = html.hasAttribute("data-header-hovered");
      const headerInteractionActive = Date.now() < headerInteractionUntilRef.current;
      const headerHidden =
        html.hasAttribute("data-site-header-hidden") &&
        !headerPinned &&
        !headerInteracting &&
        !headerHovered &&
        !headerInteractionActive;
      const header = document.getElementById("arena-site-header");
      const topAd = document.getElementById("arena-top-ad-bar");
      const compare = document.getElementById("arena-compare-bar");
      const stickyAd = document.getElementById("arena-sticky-ad-bar");

      const topAdH = readTopAdHeight(topAd);
      const topAdBottomMeasured =
        topAd && topAdH > 0
          ? Math.max(0, Math.ceil(topAd.getBoundingClientRect().bottom))
          : 0;

      html.style.setProperty("--arena-top-ad-h", `${topAdH}px`);
      html.style.setProperty("--arena-top-banner-h", `${topAdH}px`);
      if (topAdH > 0) {
        html.setAttribute("data-has-top-ad", "true");
      } else if (!document.getElementById("arena-top-ad-bar")) {
        html.removeAttribute("data-has-top-ad");
      }
      html.style.setProperty("--arena-chrome-gap", `${CHROME_GAP_PX}px`);

      const compareH = compare?.getBoundingClientRect().height ?? 0;
      const stickyAdH = stickyAd?.getBoundingClientRect().height ?? 0;
      html.style.setProperty("--arena-mobile-compare-h", `${compareH}px`);
      html.style.setProperty("--arena-mobile-sticky-ad-h", `${stickyAdH}px`);

      html.setAttribute(
        "data-compare-open",
        items.length > 0 ? "true" : "false",
      );

      if (!compactHeader && !desktopNav) {
        html.style.setProperty("--arena-mobile-header-h", "0px");
        html.style.setProperty("--arena-header-offset", "0px");
        const contentTopPad =
          topAdBottomMeasured > 0 ? topAdBottomMeasured + CHROME_GAP_PX : topAdH;
        html.style.setProperty("--arena-chrome-bottom", `${topAdBottomMeasured || topAdH}px`);
        html.style.setProperty("--arena-content-top-pad", `${contentTopPad}px`);
        syncChromeSpacer();
        html.style.setProperty("--arena-desktop-header-h", "9.5rem");
        return;
      }

      // Top ad present: keep full content padding always; hide chrome with transforms only.
      if (topAdH > 0) {
        applyFixedTopAdSpacing(header, topAd, topAdH, desktopNav);
        return;
      }

      const hiddenOffset = desktopNav ? 12 : HIDDEN_HEADER_OFFSET_PX;
      const headerVisible =
        !headerHidden ||
        headerInteractionActive ||
        headerPinned ||
        headerInteracting ||
        headerHovered;
      const forceHeaderMeasure =
        headerInteractionActive || headerPinned || headerInteracting || headerHovered;
      const stableHeaderBottom = measureHeaderBottomSafe(
        header,
        headerHidden,
        desktopNav,
        forceHeaderMeasure,
      );
      const headerBottomForAd =
        header && (forceHeaderMeasure || !headerHidden)
          ? measureNavAnchorBottom(header) || measureHeaderBottomLive(header)
          : stableHeaderBottom;
      const headerOffset = headerVisible ? stableHeaderBottom : hiddenOffset;
      const topChromeHidden =
        html.hasAttribute("data-site-header-hidden") &&
        !headerPinned &&
        !headerInteracting &&
        !headerHovered &&
        !headerInteractionActive &&
        topAdH > 0;
      const topAdBottom = topChromeHidden
        ? hiddenOffset
        : topAdH > 0
          ? headerBottomForAd + topAdH
          : topAdBottomMeasured;

      html.style.setProperty("--arena-header-offset", `${headerOffset}px`);
      html.style.setProperty("--arena-top-ad-top", `${headerBottomForAd}px`);
      html.style.setProperty("--arena-mobile-header-h", `${headerOffset}px`);

      const chromeBottom = topChromeHidden
        ? hiddenOffset
        : topAdH > 0
          ? topAdBottom
          : headerOffset;
      html.style.setProperty("--arena-chrome-bottom", `${chromeBottom}px`);

      const contentTopPad = topChromeHidden
        ? hiddenOffset
        : topAdH > 0
          ? chromeBottom
          : chromeBottom + (desktopNav && headerVisible ? DESKTOP_CONTENT_GAP_PX : 0) + CHROME_GAP_PX;

      html.style.setProperty("--arena-content-top-pad", `${contentTopPad}px`);
      syncChromeSpacer();
      if (desktopNav) {
        html.style.setProperty("--arena-desktop-header-h", `${headerOffset}px`);
      } else {
        html.style.setProperty("--arena-desktop-header-h", "9.5rem");
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const scheduleAfterHeaderTransition = () => {
      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(schedule, HEADER_TRANSITION_MS);
    };

    const onHeaderInteraction = (event: Event) => {
      if (!isHeaderTarget(event.target)) return;
      pinHeaderChrome(NAV_PIN_MS);
    };

    const onNavigate = () => {
      html.removeAttribute("data-site-header-hidden");
      pinHeaderChrome(NAV_PIN_MS);
      requestAnimationFrame(() => {
        requestAnimationFrame(schedule);
      });
      scheduleAfterHeaderTransition();
    };

    const onChromeChange = () => {
      schedule();
      scheduleAfterHeaderTransition();
    };

    const onHeaderInteractionEvent = () => {
      pinHeaderChrome(NAV_PIN_MS);
    };

    const observer = new ResizeObserver(schedule);
    const watchChrome = () => {
      observer.disconnect();
      for (const id of CHROME_IDS) {
        const node = document.getElementById(id);
        if (node) observer.observe(node);
      }
      const topAdNode = document.getElementById("arena-top-ad-bar");
      topAdNode?.querySelectorAll("img").forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", schedule, { once: true });
          img.addEventListener("error", schedule, { once: true });
        }
      });
      schedule();
    };

    watchChrome();

    const mutation = new MutationObserver(watchChrome);
    mutation.observe(document.body, { childList: true, subtree: true });

    const compactMq = window.matchMedia(COMPACT_HEADER_MEDIA_QUERY);
    const desktopMq = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY);
    const onBreakpointChange = () => {
      expandedHeaderBottomRef.current = 0;
      schedule();
    };
    compactMq.addEventListener("change", onBreakpointChange);
    desktopMq.addEventListener("change", onBreakpointChange);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", onBreakpointChange);
    const onVisualViewportChange = () => schedule();
    window.visualViewport?.addEventListener("resize", onVisualViewportChange);
    window.visualViewport?.addEventListener("scroll", onVisualViewportChange);

    const htmlAttrObserver = new MutationObserver(() => {
      schedule();
      scheduleAfterHeaderTransition();
    });
    htmlAttrObserver.observe(html, {
      attributes: true,
      attributeFilter: [
        "data-site-header-hidden",
        "data-header-pinned",
        "data-header-interacting",
        "data-header-hovered",
      ],
    });

    document.addEventListener("pointerdown", onHeaderInteraction, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchstart", onHeaderInteraction, {
      passive: true,
      capture: true,
    });
    document.addEventListener("click", onHeaderInteraction, { capture: true });
    document.addEventListener("focusin", onHeaderInteraction, { capture: true });
    window.addEventListener("arena:navigate", onNavigate);
    window.addEventListener("arena:header-chrome-change", onChromeChange);
    window.addEventListener("arena:header-interaction", onHeaderInteractionEvent);

    schedule();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(transitionTimer);
      observer.disconnect();
      mutation.disconnect();
      htmlAttrObserver.disconnect();
      compactMq.removeEventListener("change", onBreakpointChange);
      desktopMq.removeEventListener("change", onBreakpointChange);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", onBreakpointChange);
      window.visualViewport?.removeEventListener("resize", onVisualViewportChange);
      window.visualViewport?.removeEventListener("scroll", onVisualViewportChange);
      document.removeEventListener("pointerdown", onHeaderInteraction, true);
      document.removeEventListener("touchstart", onHeaderInteraction, true);
      document.removeEventListener("click", onHeaderInteraction, true);
      document.removeEventListener("focusin", onHeaderInteraction, true);
      window.removeEventListener("arena:navigate", onNavigate);
      window.removeEventListener("arena:header-chrome-change", onChromeChange);
      window.removeEventListener("arena:header-interaction", onHeaderInteractionEvent);
      html.removeAttribute("data-header-pinned");
      html.removeAttribute("data-chrome-ready");
      html.removeAttribute("data-ad-suppressed-on-pin");
      html.style.removeProperty("--arena-mobile-compare-h");
      html.style.removeProperty("--arena-mobile-header-h");
      html.style.removeProperty("--arena-mobile-sticky-ad-h");
      html.style.removeProperty("--arena-desktop-header-h");
      html.style.removeProperty("--arena-top-ad-h");
      html.style.removeProperty("--arena-top-banner-h");
      html.style.removeProperty("--arena-chrome-bottom");
      html.style.removeProperty("--arena-header-offset");
      html.style.removeProperty("--arena-top-ad-top");
      html.style.removeProperty("--arena-content-top-pad");
      html.style.removeProperty("--arena-chrome-gap");
      html.removeAttribute("data-compare-open");
    };
  }, [items.length]);

  return null;
}
