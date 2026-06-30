"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { trackPageView } from "@/lib/api";
import { resolveVisitorGeo } from "@/lib/visitor-geo";

const VISITOR_KEY = "ma_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Sends a page-view beacon for public routes (skips /admin). */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const geoRef = useRef<Promise<Awaited<ReturnType<typeof resolveVisitorGeo>>> | null>(
    null,
  );

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    if (!geoRef.current) {
      geoRef.current = resolveVisitorGeo();
    }

    void (async () => {
      try {
        const geo = await geoRef.current;
        await trackPageView({
          visitorId,
          path: pathname,
          referrer: document.referrer || undefined,
          countryCode: geo?.countryCode,
          city: geo?.city,
        });
      } catch {
        /* analytics is best-effort */
      }
    })();
  }, [pathname]);

  return null;
}
