import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";
import {
  absoluteUrl,
  localeAlternateLanguages,
  openGraphAlternateLocales,
  openGraphLocale,
} from "@/lib/seo";

import PhonesPageInner from "./PhonesPageInner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("phones.title");
  const description = t("phones.description");
  const url = absoluteUrl(`/${locale}/phones`);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternateLanguages("/phones", UNIQUE_APP_LOCALES),
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

export default function PhonesPage() {
  return (
    <ArenaShell>
      <Suspense
        fallback={
          <div className="p-8">
            <Skeleton className="h-10 w-48" />
          </div>
        }
      >
        <PhonesPageInner />
      </Suspense>
    </ArenaShell>
  );
}
