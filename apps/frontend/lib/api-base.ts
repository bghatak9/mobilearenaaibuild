export function stripEnvQuotes(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "");
}

const PUBLIC_API = stripEnvQuotes(process.env.NEXT_PUBLIC_API_URL);
const BACKEND_API = stripEnvQuotes(process.env.BACKEND_URL);

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLoopbackApiUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
}

/** Server-side fetches (SSR, RSC) — always an absolute backend URL. */
export function serverApiBase(): string {
  if (BACKEND_API) return BACKEND_API;
  if (PUBLIC_API && !PUBLIC_API.startsWith("/")) return PUBLIC_API;
  return "http://localhost:4000";
}

/**
 * Browser fetches — same-origin `/api` proxy works on localhost, LAN, tablet, and phone.
 * Override with NEXT_PUBLIC_API_URL for production CDN/API splits.
 */
export function browserApiBase(): string {
  if (typeof window === "undefined") return serverApiBase();

  const origin = window.location.origin;

  if (PUBLIC_API) {
    if (PUBLIC_API.startsWith("/")) return PUBLIC_API;
    if (isLoopbackApiUrl(PUBLIC_API) && !isLoopbackHost(window.location.hostname)) {
      return `${origin}/api`;
    }
    return PUBLIC_API;
  }

  return `${origin}/api`;
}

/** Absolute API base for browser fetch (avoids relative URL edge cases). */
export function resolveClientApiBase(): string {
  if (typeof window === "undefined") return serverApiBase();

  const base = browserApiBase();
  return base.startsWith("/") ? `${window.location.origin}${base}` : base;
}

/** Multipart uploads — same-origin proxy (works on localhost and LAN). */
export function resolveUploadApiBase(): string {
  return typeof window === "undefined"
    ? serverApiBase()
    : resolveClientApiBase();
}

/** Relative API path for href attributes (SSR-safe, any host). */
export function apiPath(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `/api/${normalized}`;
}
