export function stripEnvQuotes(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "");
}

const PUBLIC_API = stripEnvQuotes(process.env.NEXT_PUBLIC_API_URL);
const BACKEND_API = stripEnvQuotes(process.env.BACKEND_URL);

/** Server-side fetches (SSR, RSC). */
export function serverApiBase(): string {
  return BACKEND_API || PUBLIC_API || "http://localhost:4000";
}

/**
 * Browser fetches — same-origin `/api` proxy works on localhost, LAN, tablet, and phone.
 * Override with NEXT_PUBLIC_API_URL for production CDN/API splits.
 */
export function browserApiBase(): string {
  if (PUBLIC_API) return PUBLIC_API;
  if (typeof window === "undefined") return serverApiBase();
  return `${window.location.origin}/api`;
}

/** Relative API path for href attributes (SSR-safe, any host). */
export function apiPath(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `/api/${normalized}`;
}
