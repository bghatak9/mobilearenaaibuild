"use client";

import { useEffect } from "react";

import { useCompare } from "@/lib/compare-context";
import { MOBILE_MEDIA_QUERY } from "@/lib/mobile-breakpoint";

const CHROME_IDS = [
  "arena-compare-bar",
  "arena-site-header",
  "arena-sticky-ad-bar",
] as const;

/** Measure fixed mobile chrome and publish heights on :root. */
export function MobileChromeSync() {
  const { items } = useCompare();

  useEffect(() => {
    const html = document.documentElement;
    let frame = 0;

    const measure = () => {
      const mobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const header = document.getElementById("arena-site-header");

      if (desktop) {
        const compare = document.getElementById("arena-compare-bar");
        const stickyAd = document.getElementById("arena-sticky-ad-bar");

        html.style.setProperty("--arena-mobile-compare-h", "0px");
        html.style.setProperty("--arena-mobile-sticky-ad-h", "0px");
        html.style.setProperty("--arena-mobile-header-h", "0px");

        const headerRect = header?.getBoundingClientRect();
        const headerPad = headerRect
          ? Math.ceil(headerRect.bottom + 12)
          : 152;
        html.style.setProperty("--arena-desktop-header-h", `${headerPad}px`);

        html.setAttribute(
          "data-compare-open",
          items.length > 0 ? "true" : "false",
        );
        return;
      }

      if (!mobile) {
        html.style.setProperty("--arena-mobile-compare-h", "0px");
        html.style.setProperty("--arena-mobile-header-h", "0px");
        html.style.setProperty("--arena-mobile-sticky-ad-h", "0px");
        html.style.setProperty("--arena-desktop-header-h", "9.5rem");
        html.removeAttribute("data-compare-open");
        return;
      }

      const compare = document.getElementById("arena-compare-bar");
      const stickyAd = document.getElementById("arena-sticky-ad-bar");

      html.style.setProperty(
        "--arena-mobile-compare-h",
        `${compare?.getBoundingClientRect().height ?? 0}px`,
      );
      html.style.setProperty(
        "--arena-mobile-sticky-ad-h",
        `${stickyAd?.getBoundingClientRect().height ?? 0}px`,
      );

      const headerRect = header?.getBoundingClientRect();
      const headerPad = headerRect
        ? Math.ceil(headerRect.bottom + 8)
        : 72;
      html.style.setProperty("--arena-mobile-header-h", `${headerPad}px`);
      html.style.setProperty("--arena-desktop-header-h", "9.5rem");
      html.setAttribute(
        "data-compare-open",
        items.length > 0 ? "true" : "false",
      );
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    const watchChrome = () => {
      observer.disconnect();
      for (const id of CHROME_IDS) {
        const node = document.getElementById(id);
        if (node) observer.observe(node);
      }
      schedule();
    };

    watchChrome();

    const mutation = new MutationObserver(watchChrome);
    mutation.observe(document.body, { childList: true, subtree: true });

    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    mq.addEventListener("change", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      mq.removeEventListener("change", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.removeEventListener("scroll", schedule);
      html.style.removeProperty("--arena-mobile-compare-h");
      html.style.removeProperty("--arena-mobile-header-h");
      html.style.removeProperty("--arena-mobile-sticky-ad-h");
      html.style.removeProperty("--arena-desktop-header-h");
      html.removeAttribute("data-compare-open");
    };
  }, [items.length]);

  return null;
}
