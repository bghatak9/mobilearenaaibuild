import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import JsonLd from "@/components/seo/JsonLd";
import InArticleContent from "@/components/ads/InArticleContent";
import { AffiliateAdBlock } from "@/components/ads/PageAdBlocks";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { absoluteUrl, localeAlternateLanguages, openGraphAlternateLocales, openGraphLocale } from "@/lib/seo";
import { getReviewBySlug, getActiveAdvertisements, type Review } from "@/lib/api";
import { resolvePageAdBundle } from "@/lib/ad-utils";
import { UNIQUE_APP_LOCALES, getLocaleMeta } from "@/i18n/locales";

function summarize(review: Review): string {
  return (
    review.seoDescription ??
    review.content.replace(/\s+/g, " ").slice(0, 160).trim()
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const review = await getReviewBySlug(slug, locale);
    const description = summarize(review);
    const title = review.seoTitle ?? review.title;
    const url = absoluteUrl(`/${locale}/reviews/${review.slug}`);
    return {
      title,
      description,
      keywords: review.keywords ?? undefined,
      alternates: {
        canonical: url,
        languages: localeAlternateLanguages(
          `/reviews/${review.slug}`,
          UNIQUE_APP_LOCALES,
          review.localeSlugs,
        ),
      },
      openGraph: {
        type: "article",
        url,
        title,
        description,
        locale: openGraphLocale(locale),
        alternateLocale: openGraphAlternateLocales(locale, UNIQUE_APP_LOCALES),
      },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    const t = await getTranslations({ locale, namespace: "errors" });
    return { title: t("reviewNotFound") };
  }
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let review: Review;
  try {
    review = await getReviewBySlug(slug, locale);
  } catch {
    notFound();
  }

  const ads = await getActiveAdvertisements().catch(() => []);
  const pageAds = resolvePageAdBundle(ads);
  const tReviews = await getTranslations("reviews");

  const pros = Array.isArray(review.pros) ? review.pros : [];
  const cons = Array.isArray(review.cons) ? review.cons : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    reviewBody: review.content,
    datePublished: review.publishedAt,
    inLanguage: getLocaleMeta(locale).bcp47,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.score,
      bestRating: 10,
      worstRating: 0,
    },
    author: { "@type": "Organization", name: "MobileArena" },
    ...(review.device
      ? { itemReviewed: { "@type": "Product", name: review.device.name } }
      : {}),
  };

  return (
    <ArenaShell ads={ads} slots={pageAds.slots}>
      <JsonLd data={jsonLd} />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: tReviews("home"), href: "/" },
          { label: tReviews("breadcrumb"), href: "/reviews" },
          { label: review.title },
        ]}
      />

      <SpectrumPanel className="p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] md:text-4xl">
            {review.title}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--premium-gold)]/15 px-4 py-2 text-lg font-bold text-[var(--premium-gold)]">
            <Star size={18} className="fill-current" />
            {review.score.toFixed(1)}/10
          </span>
        </div>

        {review.device && (
          <Link
            href={`/phones/${review.device.slug}`}
            className="mt-2 inline-block text-[var(--electric-cyan)] hover:underline"
          >
            {review.device.name} →
          </Link>
        )}

        <InArticleContent
          content={review.content}
          ads={ads}
          reservedAdIds={pageAds.reserved}
          className="prose prose-invert mt-8 max-w-none prose-p:text-[var(--text-secondary)]"
        />

        <AffiliateAdBlock ad={pageAds.affiliateAd} />

        {(pros.length > 0 || cons.length > 0) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {pros.length > 0 && (
              <div className="rounded-[20px] border border-[var(--emerald-success)]/30 bg-[var(--emerald-success)]/10 p-5">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--emerald-success)]">
                  <ThumbsUp size={16} /> {tReviews("pros")}
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-primary)]">
                  {pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div className="rounded-[20px] border border-red-500/30 bg-red-500/10 p-5">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-red-400">
                  <ThumbsDown size={16} /> {tReviews("cons")}
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-primary)]">
                  {cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SpectrumPanel>
    </ArenaShell>
  );
}
