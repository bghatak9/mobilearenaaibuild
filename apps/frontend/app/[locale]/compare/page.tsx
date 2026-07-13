import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";
import {
  absoluteUrl,
  localeAlternateLanguages,
  openGraphAlternateLocales,
  openGraphLocale,
} from "@/lib/seo";

import ComparePageInner from "./ComparePageInner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("compare.title");
  const description = t("compare.description");
  const url = absoluteUrl(`/${locale}/compare`);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternateLanguages("/compare", UNIQUE_APP_LOCALES),
    },
    openGraph: {
      title,
      description,
      url,
      locale: openGraphLocale(locale),
      alternateLocale: openGraphAlternateLocales(locale, UNIQUE_APP_LOCALES),
    },
  };
}

export default function ComparePage() {
  return (
    <ArenaShell>
      <ComparePageInner />
    </ArenaShell>
  );
}
