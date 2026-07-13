import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { getReviews, type Review } from "@/lib/api";
import { absoluteUrl, localeAlternateLanguages } from "@/lib/seo";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return {
    title: t("title"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/reviews`),
      languages: localeAlternateLanguages("/reviews", UNIQUE_APP_LOCALES),
    },
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  let reviews: Review[] = [];
  let error = false;
  try {
    reviews = await getReviews(undefined, locale);
  } catch {
    error = true;
  }

  return (
    <ArenaShell>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
          Editor&apos;s Arena
        </p>
        <h1 className="arena-page-title mt-2 font-extrabold text-[var(--text-primary)]">
          {t("title")}
        </h1>
      </header>

      {error ? (
        <p className="text-red-400">{t("loadError")}</p>
      ) : reviews.length === 0 ? (
        <SpectrumPanel className="p-8 text-center text-[var(--text-secondary)]">
          {t("empty")}
        </SpectrumPanel>
      ) : (
        <ReviewsList reviews={reviews} />
      )}
    </ArenaShell>
  );
}
