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

const CHROME_GAP_PX = 6;
const DESKTOP_CONTENT_GAP_PX = 12;
const HIDDEN_HEADER_OFFSET_PX = 8;
const HEADER_SELECTOR = "#arena-site-header";
const HEADER_TRANSITION_MS = 320;
const NAV_PIN_MS = 1200;
const DESKTOP_HEADER_MIN_PX = 176;
const COMPACT_HEADER_MIN_PX = 96;

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

    const pinHeaderChrome = (durationMs = NAV_PIN_MS) => {
      headerInteractionUntilRef.current = Date.now() + durationMs;
      html.setAttribute("data-header-pinned", "true");
      html.removeAttribute("data-site-header-hidden");
      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        html.removeAttribute("data-header-pinned");
        schedule();
      }, durationMs);
      schedule();
      scheduleAfterHeaderTransition();
      window.setTimeout(schedule, 50);
      window.setTimeout(schedule, HEADER_TRANSITION_MS);
      window.setTimeout(schedule, durationMs);
    };

    const measureHeaderBottom = (
      header: HTMLElement | null,
      headerHidden: boolean,
      desktopNav: boolean,
      forceMeasure: boolean,
    ): number => {
      const cached = expandedHeaderBottomRef.current;
      const floor = desktopNav ? DESKTOP_HEADER_MIN_PX : COMPACT_HEADER_MIN_PX;

      if (!header) {
        return Math.max(cached, floor);
      }

      if (header && (forceMeasure || !headerHidden)) {
        const measured = Math.max(0, Math.ceil(header.getBoundingClientRect().bottom));
        if (measured > 48) {
          expandedHeaderBottomRef.current = Math.max(cached, measured);
        }
        return Math.max(
          expandedHeaderBottomRef.current,
          measured > 48 ? measured : 0,
          floor,
        );
      }

      return Math.max(cached, floor);
    };

    const measure = () => {
      const compactHeader = window.matchMedia(COMPACT_HEADER_MEDIA_QUERY).matches;
      const desktopNav = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY).matches;
      const headerPinned = html.hasAttribute("data-header-pinned");
      const headerInteracting = html.hasAttribute("data-header-interacting");
      const headerInteractionActive = Date.now() < headerInteractionUntilRef.current;
      const headerHidden =
        html.hasAttribute("data-site-header-hidden") &&
        !headerPinned &&
        !headerInteracting &&
        !headerInteractionActive;
      const header = document.getElementById("arena-site-header");
      const topAd = document.getElementById("arena-top-ad-bar");
      const compare = document.getElementById("arena-compare-bar");
      const stickyAd = document.getElementById("arena-sticky-ad-bar");

      const topAdH = topAd
        ? Math.max(0, Math.ceil(topAd.getBoundingClientRect().height))
        : 0;
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
        html.style.setProperty("--arena-desktop-header-h", "9.5rem");
        return;
      }

      const hiddenOffset = desktopNav ? 12 : HIDDEN_HEADER_OFFSET_PX;
      const headerVisible = !headerHidden || headerInteractionActive || headerPinned || headerInteracting;
      const forceHeaderMeasure = headerInteractionActive || headerPinned || headerInteracting;
      const stableHeaderBottom = measureHeaderBottom(
        header,
        headerHidden,
        desktopNav,
        forceHeaderMeasure,
      );
      const headerOffset = headerVisible ? stableHeaderBottom : hiddenOffset;
      const topAdBottomExpected = topAdH > 0 ? stableHeaderBottom + topAdH : 0;
      const topAdBottom = Math.max(topAdBottomMeasured, topAdBottomExpected);

      html.style.setProperty("--arena-header-offset", `${headerOffset}px`);
      html.style.setProperty("--arena-top-ad-top", `${stableHeaderBottom}px`);
      html.style.setProperty("--arena-mobile-header-h", `${headerOffset}px`);

      const chromeBottom = topAdBottom > 0 ? topAdBottom : headerOffset;
      html.style.setProperty("--arena-chrome-bottom", `${chromeBottom}px`);

      const trailingGap =
        (desktopNav && headerVisible ? DESKTOP_CONTENT_GAP_PX : 0) + CHROME_GAP_PX;
      const contentTopPad = chromeBottom + trailingGap;

      html.style.setProperty("--arena-content-top-pad", `${contentTopPad}px`);
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
      pinHeaderChrome(NAV_PIN_MS);
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
      document.removeEventListener("pointerdown", onHeaderInteraction, true);
      document.removeEventListener("touchstart", onHeaderInteraction, true);
      document.removeEventListener("click", onHeaderInteraction, true);
      document.removeEventListener("focusin", onHeaderInteraction, true);
      window.removeEventListener("arena:navigate", onNavigate);
      window.removeEventListener("arena:header-interaction", onHeaderInteractionEvent);
      html.removeAttribute("data-header-pinned");
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
