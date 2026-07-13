"use client";

import { useSyncExternalStore } from "react";

import { MOBILE_MEDIA_QUERY } from "@/lib/mobile-breakpoint";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** SSR-safe mobile breakpoint — server and first client paint both return false. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
