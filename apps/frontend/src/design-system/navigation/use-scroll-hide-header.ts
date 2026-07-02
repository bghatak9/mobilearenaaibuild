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
const HEADER_SELECTOR = "#arena-site-header";
const HEADER_HOVER_SELECTOR = "#arena-site-header, #arena-top-ad-bar";

function readScrollY(): number {
  const el = document.scrollingElement ?? document.documentElement;
  return Math.max(0, el.scrollTop || window.scrollY || 0);
}

function chromeActive(): boolean {
  return (
    window.matchMedia(COMPACT_HEADER_MEDIA_QUERY).matches ||
    window.matchMedia(DESKTOP_NAV_MEDIA_QUERY).matches
  );
}

function isHeaderTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  return Boolean((target as Element).closest?.(HEADER_SELECTOR));
}

/**
 * Scrolling down the page hides the header and top ad; scrolling up reveals them.
 * Header/ad taps and hover keep chrome visible.
 */
export function useScrollHideHeader() {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);
  const headerInteractionUntilRef = useRef(0);

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
      } else {
        root.removeAttribute("data-site-header-hidden");
      }
      window.dispatchEvent(new CustomEvent("arena:header-chrome-change"));
    };

    const headerInteractionActive = () =>
      Date.now() < headerInteractionUntilRef.current;

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

    const onScroll = () => {
      const y = readScrollY();

      setScrolled(y > 20);

      if (!chromeActive()) {
        sync(false);
        lastY.current = y;
        return;
      }

      if (headerInteractionActive()) {
        sync(false);
        lastY.current = y;
        return;
      }

      if (document.documentElement.hasAttribute("data-header-hovered")) {
        sync(false);
        lastY.current = y;
        return;
      }

      const delta = y - lastY.current;

      if (y <= REVEAL_AT_Y) {
        sync(false);
      } else if (delta > DELTA_THRESHOLD && y > HIDE_AFTER_Y) {
        sync(true);
      } else if (delta < -DELTA_THRESHOLD) {
        sync(false);
      }

      lastY.current = y;
    };

    const onHeaderInteraction = (event: Event) => {
      if (!isHeaderTarget(event.target)) return;
      pinHeader();
    };

    const onNavigate = () => {
      pinHeader();
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
    window.addEventListener("arena:navigate", onNavigate);
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
      window.removeEventListener("arena:navigate", onNavigate);
      document.removeEventListener("pointerdown", onHeaderInteraction, true);
      document.removeEventListener("touchstart", onHeaderInteraction, true);
      document.removeEventListener("click", onHeaderInteraction, true);
      document.removeEventListener("focusin", onHeaderInteraction, true);
      document.documentElement.removeAttribute("data-header-interacting");
      document.documentElement.removeAttribute("data-header-hovered");
    };
  }, []);

  return { headerHidden, setHeaderHidden, scrolled };
}
