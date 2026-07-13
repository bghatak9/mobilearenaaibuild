import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { resolveLocaleRedirect } from "./i18n/locales";
import { routing } from "./i18n/routing";

/**
 * Next.js 16 proxy (formerly middleware).
 * - Canonical locale redirects (zh → zh-CN, pt → pt-PT, …)
 * - First visit: Accept-Language negotiation via next-intl (localeDetection)
 *   e.g. bn-IN,en-US,hi → /bn; en-GB → /en-GB; pt → /pt-PT
 * - Cookie (`mobilearena_lang`) wins after a manual pick or explicit locale URL
 * - Admin / API stay outside locale prefixes
 */
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/change-password")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (maybeLocale) {
    const canonical = resolveLocaleRedirect(maybeLocale);
    if (canonical && canonical !== maybeLocale) {
      const url = request.nextUrl.clone();
      segments[1] = canonical;
      url.pathname = segments.join("/") || "/";
      return NextResponse.redirect(url, 308);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
