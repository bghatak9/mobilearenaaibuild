"use client";

import { useEffect, useRef, useState } from "react";

import {
  COMPACT_HEADER_MEDIA_QUERY,
  DESKTOP_NAV_MEDIA_QUERY,
} from "@/lib/mobile-breakpoint";

const REVEAL_AT_Y = 32;
const HIDE_AFTER_Y = 56;
const DELTA_THRESHOLD = 2;
const HEADER_INTERACTION_MS = 1200;
const TOP_CHROME_SELECTOR = "#arena-site-header, #arena-top-ad-bar";
const HEADER_HOVER_SELECTOR = "#arena-site-header, #arena-top-ad-bar";

function readScrollY(): number {
  const el = document.scrollingElement ?? document.documentElement;
  const viewportY =
    typeof window !== "undefined" && window.visualViewport
      ? window.visualViewport.pageTop
      : 0;
  return Math.max(0, el.scrollTop || window.scrollY || viewportY || 0);
}

function chromeActive(): boolean {
  return (
    window.matchMedia(COMPACT_HEADER_MEDIA_QUERY).matches ||
    window.matchMedia(DESKTOP_NAV_MEDIA_QUERY).matches
  );
}

function isChromeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  return Boolean((target as Element).closest?.(TOP_CHROME_SELECTOR));
}

/**
 * Finger swipe up / scroll down the page hides the header and top ad.
 * Finger swipe down / scroll back up reveals them.
 * Header/ad taps and hover keep chrome visible.
 */
export function useScrollHideHeader() {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);
  const headerInteractionUntilRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    hiddenRef.current = headerHidden;
  }, [headerHidden]);

  useEffect(() => {
    lastY.current = readScrollY();

    const sync = (nextHidden: boolean) => {
      if (hiddenRef.current === nextHidden) return;
      hiddenRef.current = nextHidden;
      setHeaderHidden(nextHidden);
      const root = document.documentElement;
      if (nextHidden) {
        root.setAttribute("data-site-header-hidden", "true");
        root.removeAttribute("data-header-pinned");
        root.removeAttribute("data-header-interacting");
      } else {
        root.removeAttribute("data-site-header-hidden");
      }
      window.dispatchEvent(new CustomEvent("arena:header-chrome-change"));
    };

    const headerInteractionActive = () =>
      Date.now() < headerInteractionUntilRef.current;

    const scrollHideBlocked = () =>
      !chromeActive() ||
      headerInteractionActive() ||
      document.documentElement.hasAttribute("data-header-hovered");

    const setHeaderHovered = (hovered: boolean) => {
      if (hovered) {
        document.documentElement.setAttribute("data-header-hovered", "true");
      } else {
        document.documentElement.removeAttribute("data-header-hovered");
      }
    };

    const pinHeader = () => {
      headerInteractionUntilRef.current = Date.now() + HEADER_INTERACTION_MS;
      lastY.current = readScrollY();
      sync(false);
      document.documentElement.setAttribute("data-header-interacting", "true");
      window.dispatchEvent(new CustomEvent("arena:header-interaction"));
    };

    const onHeaderEnter = () => {
      setHeaderHovered(true);
      sync(false);
      document.documentElement.removeAttribute("data-site-header-hidden");
      document.documentElement.setAttribute("data-header-interacting", "true");
      window.dispatchEvent(new CustomEvent("arena:header-interaction"));
    };

    const onHeaderLeave = (event: PointerEvent) => {
      const related = event.relatedTarget;
      if (related instanceof Node) {
        for (const selector of HEADER_HOVER_SELECTOR.split(",").map((s) => s.trim())) {
          const zone = document.querySelector(selector);
          if (zone?.contains(related)) return;
        }
      }
      setHeaderHovered(false);
    };

    const applyScrollDelta = (delta: number, y: number) => {
      if (scrollHideBlocked()) {
        if (!chromeActive()) sync(false);
        return;
      }

      if (y <= REVEAL_AT_Y) {
        sync(false);
      } else if (delta > DELTA_THRESHOLD && y > HIDE_AFTER_Y) {
        // Swipe up / read down → hide header + top ad
        sync(true);
      } else if (delta < -DELTA_THRESHOLD) {
        // Swipe down / scroll back up → reveal header + top ad
        sync(false);
      }
    };

    const onScroll = () => {
      const y = readScrollY();
      setScrolled(y > 20);

      if (scrollHideBlocked()) {
        if (!chromeActive()) sync(false);
        lastY.current = y;
        return;
      }

      applyScrollDelta(y - lastY.current, y);
      lastY.current = y;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchStartYRef.current = null;
        return;
      }
      touchStartYRef.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      if (startY == null || event.touches.length !== 1 || scrollHideBlocked()) return;

      const currentY = event.touches[0].clientY;
      const fingerDelta = startY - currentY;
      if (Math.abs(fingerDelta) < 6) return;

      const y = readScrollY();
      applyScrollDelta(fingerDelta, y);
      lastY.current = y;
      touchStartYRef.current = currentY;
    };

    const onTouchEnd = () => {
      touchStartYRef.current = null;
    };

    const onWheel = (event: WheelEvent) => {
      if (scrollHideBlocked()) return;
      const y = readScrollY();
      applyScrollDelta(event.deltaY, y);
      lastY.current = y;
    };

    const onHeaderInteraction = (event: Event) => {
      if (!isChromeTarget(event.target)) return;
      pinHeader();
    };

    const onNavigate = () => {
      lastY.current = readScrollY();
      sync(false);
    };

    const clearInteractingAttr = () => {
      if (
        !headerInteractionActive() &&
        !document.documentElement.hasAttribute("data-header-hovered")
      ) {
        document.documentElement.removeAttribute("data-header-interacting");
      }
    };

    const interactingTimer = window.setInterval(clearInteractingAttr, 200);

    const bindHeaderHover = () => {
      for (const selector of HEADER_HOVER_SELECTOR.split(",").map((s) => s.trim())) {
        const node = document.querySelector<HTMLElement>(selector);
        if (!node || node.dataset.arenaHoverBound === "true") continue;
        node.dataset.arenaHoverBound = "true";
        node.addEventListener("pointerenter", onHeaderEnter);
        node.addEventListener("pointerleave", onHeaderLeave);
      }
    };

    bindHeaderHover();
    const hoverObserver = new MutationObserver(bindHeaderHover);
    hoverObserver.observe(document.body, { childList: true, subtree: true });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.visualViewport?.addEventListener("scroll", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    window.addEventListener("arena:navigate", onNavigate);
    document.addEventListener("pointerdown", onHeaderInteraction, {
      passive: true,
      capture: true,
    });
    document.addEventListener("click", onHeaderInteraction, { capture: true });
    document.addEventListener("focusin", onHeaderInteraction, { capture: true });

    return () => {
      window.clearInterval(interactingTimer);
      hoverObserver.disconnect();
      for (const selector of HEADER_HOVER_SELECTOR.split(",").map((s) => s.trim())) {
        const node = document.querySelector<HTMLElement>(selector);
        if (!node) continue;
        node.removeEventListener("pointerenter", onHeaderEnter);
        node.removeEventListener("pointerleave", onHeaderLeave);
        delete node.dataset.arenaHoverBound;
      }
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      window.removeEventListener("arena:navigate", onNavigate);
      document.removeEventListener("pointerdown", onHeaderInteraction, true);
      document.removeEventListener("click", onHeaderInteraction, true);
      document.removeEventListener("focusin", onHeaderInteraction, true);
      document.documentElement.removeAttribute("data-header-interacting");
      document.documentElement.removeAttribute("data-header-hovered");
    };
  }, []);

  return { headerHidden, setHeaderHidden, scrolled };
}
