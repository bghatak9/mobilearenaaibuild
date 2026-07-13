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

import CommunityPageInner from "./CommunityPageInner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("community.title");
  const description = t("community.description");
  const url = absoluteUrl(`/${locale}/community`);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternateLanguages("/community", UNIQUE_APP_LOCALES),
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

export default function CommunityPage() {
  return (
    <ArenaShell>
      <CommunityPageInner />
    </ArenaShell>
  );
}
