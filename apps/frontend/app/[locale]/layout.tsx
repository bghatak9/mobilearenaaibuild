import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import Providers from "../providers";
import { catalogImportedOnlyFromEnv } from "@/lib/catalog-mode";
import { getLocaleMeta, getMessagePackLocales, UNIQUE_APP_LOCALES } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { DEFAULT_THEME, THEME_COOKIE } from "@/design-system/themes";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { SiteLanguageCode } from "@/features/i18n";
import type { Theme } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return getMessagePackLocales().map((locale) => ({ locale }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = getLocaleMeta(locale);
  const messages = (await getMessages({ locale })) as {
    metadata?: { title?: string; description?: string };
  };
  const title =
    messages.metadata?.title ??
    "MobileArena — Discover. Compare. Decide. Together.";
  const description =
    messages.metadata?.description ??
    "A premium, community-driven smartphone platform. Browse specs, compare devices, read reviews, and join the Arena.";

  const languages: Record<string, string> = {};
  for (const loc of UNIQUE_APP_LOCALES) {
    languages[getLocaleMeta(loc).bcp47] = `${SITE_URL}/${loc}`;
  }
  languages["x-default"] = `${SITE_URL}/en`;

  return {
    title: {
      default: title,
      template: `%s — ${SITE_NAME}`,
    },
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: `${SITE_URL}/${locale}`,
      title,
      description,
      locale: meta.bcp47.replace("-", "_"),
      alternateLocale: UNIQUE_APP_LOCALES.filter((l) => l !== locale).map((l) =>
        getLocaleMeta(l).bcp47.replace("-", "_"),
      ),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const themeCookie = (await cookies()).get(THEME_COOKIE)?.value;
  const initialTheme: Theme =
    themeCookie === "light" || themeCookie === "dark"
      ? themeCookie
      : DEFAULT_THEME;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers
        importedOnly={catalogImportedOnlyFromEnv()}
        initialLanguage={locale as SiteLanguageCode}
        initialTheme={initialTheme}
      >
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}
