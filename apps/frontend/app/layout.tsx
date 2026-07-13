import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import Analytics from "@/components/analytics/Analytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { SITE_LANGUAGE_COOKIE } from "@/features/i18n/languages";
import {
  getLocaleMeta,
  isRtlLocale,
  negotiateAppLocale,
} from "@/i18n/locales";
import { siteFontVariables } from "@/lib/site-fonts";
import { DEFAULT_THEME, THEME_COOKIE } from "@/design-system/themes";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Theme } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#070B14",
};

function readThemeCookie(raw: string | undefined): Theme {
  if (raw === "light" || raw === "dark") return raw;
  return DEFAULT_THEME;
}

/**
 * Root shell shared by public `[locale]` routes and unprefixed `/admin`.
 * Theme + lang/dir come from cookies/headers — no React <script> FOUC hacks
 * (those trigger React 19 / Next 16 console errors and do not run on the client).
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const hdrs = await headers();
  const cookieLocale = jar.get(SITE_LANGUAGE_COOKIE)?.value;
  const locale = negotiateAppLocale(
    cookieLocale ??
      hdrs.get("accept-language") ??
      hdrs.get("x-next-intl-locale") ??
      "en",
  );
  const meta = getLocaleMeta(locale);
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const theme = readThemeCookie(jar.get(THEME_COOKIE)?.value);
  const isDark = theme === "dark";

  return (
    <html
      lang={meta.bcp47 || "en"}
      dir={dir}
      data-site-lang={locale}
      className={`${siteFontVariables} ${isDark ? "dark" : ""} h-full antialiased`}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body
        className="min-h-full min-h-[100dvh] flex flex-col bg-background text-foreground"
        translate="yes"
      >
        {children}
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}
