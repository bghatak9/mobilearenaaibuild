import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { absoluteUrl, localeAlternateLanguages } from "@/lib/seo";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("finder.title"),
    description: t("finder.description"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/phone-finder`),
      languages: localeAlternateLanguages("/phone-finder", UNIQUE_APP_LOCALES),
    },
  };
}

export default function PhoneFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
