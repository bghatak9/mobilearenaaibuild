"use client";

import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";

const ANALYTICS_SRC = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
const VITALS_ENDPOINT = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;

/**
 * Privacy-friendly analytics + Core Web Vitals reporting. Everything is gated
 * on env vars, so with no configuration this renders nothing and sends nothing.
 */
export default function Analytics() {
  useReportWebVitals((metric) => {
    if (!VITALS_ENDPOINT) return;

    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(VITALS_ENDPOINT, body);
    } else {
      void fetch(VITALS_ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  if (!ANALYTICS_SRC || !ANALYTICS_DOMAIN) return null;

  return (
    <Script
      src={ANALYTICS_SRC}
      data-domain={ANALYTICS_DOMAIN}
      strategy="afterInteractive"
    />
  );
}
