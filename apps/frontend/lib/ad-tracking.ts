import type { MouseEvent } from "react";

import { API_URL } from "@/lib/api";
import { getCachedVisitorCountryCode } from "@/lib/visitor-geo";

const VISITOR_KEY = "ma_visitor_id";
const IMPRESSION_SENT = new Set<string>();

/** Public API base for href attributes — stable across SSR and hydration. */
const PUBLIC_CLICK_API =
  process.env.NEXT_PUBLIC_API_URL?.replace(/^["']|["']$/g, "") ||
  "http://localhost:4000";

export function getVisitorId(): string {
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

/** SSR-safe click URL — omits client-only geo so hydration matches. */
export function getAdClickUrl(adId: number, placement?: string): string {
  const params = new URLSearchParams();
  if (placement) params.set("placement", placement);
  const qs = params.toString();
  return `${PUBLIC_CLICK_API}/advertisements/click/${adId}${qs ? `?${qs}` : ""}`;
}

function withClientGeo(url: string): string {
  const countryCode = getCachedVisitorCountryCode();
  if (!countryCode) return url;
  const parsed = new URL(url);
  parsed.searchParams.set("countryCode", countryCode);
  return parsed.toString();
}

/** Append cached visitor country on click (client-only). */
export function handleAdClick(
  event: MouseEvent<HTMLAnchorElement>,
  url: string,
): void {
  const withGeo = withClientGeo(url);
  if (withGeo === url) return;
  event.preventDefault();
  window.open(withGeo, "_blank", "noopener,noreferrer");
}

export async function trackAdImpression(
  adId: number,
  placement?: string,
  path?: string,
): Promise<void> {
  const key = `${adId}:${placement ?? ""}:${path ?? ""}`;
  if (IMPRESSION_SENT.has(key)) return;
  IMPRESSION_SENT.add(key);

  try {
    const countryCode = getCachedVisitorCountryCode();
    await fetch(`${API_URL}/advertisements/${adId}/impression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placement,
        path: path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        visitorId: getVisitorId(),
        ...(countryCode ? { countryCode } : {}),
      }),
      keepalive: true,
    });
  } catch {
    IMPRESSION_SENT.delete(key);
  }
}
