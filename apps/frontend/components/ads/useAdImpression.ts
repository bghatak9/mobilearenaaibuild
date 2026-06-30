"use client";

import { useEffect, useRef } from "react";

import { trackAdImpression } from "@/lib/ad-tracking";

export function useAdImpression(adId: number | undefined, placement?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!adId || tracked.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (tracked.current) return;
        const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5);
        if (!visible) return;
        tracked.current = true;
        void trackAdImpression(adId, placement);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [adId, placement]);

  return ref;
}
