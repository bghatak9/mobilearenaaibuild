"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 639px)";
const TABLET_QUERY = "(max-width: 1023px)";

function getPageSize(): number {
  if (typeof window === "undefined") return 6;
  if (window.matchMedia(MOBILE_QUERY).matches) return 4;
  if (window.matchMedia(TABLET_QUERY).matches) return 6;
  return 9;
}

function subscribe(onChange: () => void) {
  const mobile = window.matchMedia(MOBILE_QUERY);
  const tablet = window.matchMedia(TABLET_QUERY);
  mobile.addEventListener("change", onChange);
  tablet.addEventListener("change", onChange);
  return () => {
    mobile.removeEventListener("change", onChange);
    tablet.removeEventListener("change", onChange);
  };
}

function getServerSnapshot() {
  return 6;
}

/** Responsive items-per-page for swipe pagination (4 mobile / 6 tablet / 9 desktop). */
export function useResponsiveSwipePageSize(): number {
  return useSyncExternalStore(subscribe, getPageSize, getServerSnapshot);
}
