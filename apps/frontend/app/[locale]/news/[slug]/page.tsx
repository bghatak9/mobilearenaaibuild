import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ArenaShell } from "@/components/layout/ArenaShell";
import JsonLd from "@/components/seo/JsonLd";
import InArticleContent from "@/components/ads/InArticleContent";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { FormattedDate } from "@/components/ui/FormattedDate";
import { absoluteUrl, localeAlternateLanguages, openGraphAlternateLocales, openGraphLocale } from "@/lib/seo";
import { getNewsBySlug, getActiveAdvertisements, type NewsArticle } from "@/lib/api";
import { resolvePageAdBundle } from "@/lib/ad-utils";
import { UNIQUE_APP_LOCALES, getLocaleMeta } from "@/i18n/locales";

function summarize(article: NewsArticle): string {
  return (
    article.seoDescription ??
    article.excerpt ??
    article.content.replace(/\s+/g, " ").slice(0, 160).trim()
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const article = await getNewsBySlug(slug, locale);
    const description = summarize(article);
    const title = article.seoTitle ?? article.title;
    const url = absoluteUrl(`/${locale}/news/${article.slug}`);
    const published = article.publishedAt ?? article.createdAt;
    const imageAlt = title;
    return {
      title,
      description,
      keywords: article.keywords ?? undefined,
      alternates: {
        canonical: url,
        languages: localeAlternateLanguages(
          `/news/${article.slug}`,
          UNIQUE_APP_LOCALES,
          article.localeSlugs,
        ),
      },
      openGraph: {
        type: "article",
        url,
        title,
        description,
        publishedTime: published,
        locale: openGraphLocale(locale),
        alternateLocale: openGraphAlternateLocales(locale, UNIQUE_APP_LOCALES),
        ...(article.thumbnail
          ? { images: [{ url: article.thumbnail, alt: imageAlt }] }
          : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(article.thumbnail ? { images: [article.thumbnail] } : {}),
      },
    };
  } catch {
    const t = await getTranslations({ locale, namespace: "errors" });
    return { title: t("articleNotFound") };
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let article: NewsArticle;
  try {
    article = await getNewsBySlug(slug, locale);
  } catch {
    notFound();
  }

  const ads = await getActiveAdvertisements().catch(() => []);
  const pageAds = resolvePageAdBundle(ads);
  const tNews = await getTranslations("news");

  const published = article.publishedAt ?? article.createdAt;
  const pageUrl = absoluteUrl(`/${locale}/news/${article.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: summarize(article),
    datePublished: published,
    dateModified: published,
    inLanguage: getLocaleMeta(locale).bcp47,
    ...(article.thumbnail ? { image: [article.thumbnail] } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    publisher: { "@type": "Organization", name: "MobileArena" },
  };

  return (
    <ArenaShell ads={ads} slots={pageAds.slots}>
      <JsonLd data={jsonLd} />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: tNews("home"), href: "/" },
          { label: tNews("breadcrumb"), href: "/news" },
          { label: article.title },
        ]}
      />

      <SpectrumPanel className="p-6 md:p-10">
        {article.featured && (
          <span className="mb-3 inline-block rounded-full bg-[var(--premium-gold)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--premium-gold)]">
            {tNews("featured")}
          </span>
        )}

        <h1 className="text-3xl font-extrabold leading-tight text-[var(--text-primary)] md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          <FormattedDate
            value={article.publishedAt ?? article.createdAt}
            variant="long"
          />
        </p>

        {article.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail}
            alt={article.title}
            className="mt-6 w-full rounded-[20px] object-cover"
          />
        )}

        <InArticleContent
          content={article.content}
          ads={ads}
          reservedAdIds={pageAds.reserved}
          className="prose prose-invert mt-8 max-w-none prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)]"
        />
      </SpectrumPanel>
    </ArenaShell>
  );
}
