import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Analytics from "@/components/analytics/Analytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { catalogImportedOnlyFromEnv } from "@/lib/catalog-mode";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "MobileArena — Discover. Compare. Decide. Together.";
const DESCRIPTION =
  "A premium, community-driven smartphone platform. Browse specs, compare devices, read reviews, and join the Arena.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "smartphones",
    "phone specs",
    "phone comparison",
    "phone reviews",
    "mobile news",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c12" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const importedOnly = catalogImportedOnlyFromEnv();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full min-h-[100dvh] flex flex-col bg-background text-foreground">
        <ThemeInitScript />
        <Providers importedOnly={importedOnly}>{children}</Providers>
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}
