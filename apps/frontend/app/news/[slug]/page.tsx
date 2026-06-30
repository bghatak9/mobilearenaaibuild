import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArenaShell } from "@/components/layout/ArenaShell";
import JsonLd from "@/components/seo/JsonLd";
import InArticleContent from "@/components/ads/InArticleContent";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { absoluteUrl } from "@/lib/seo";
import { getNewsBySlug, getActiveAdvertisements, type NewsArticle } from "@/lib/api";

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function summarize(article: NewsArticle): string {
  return (
    article.excerpt ?? article.content.replace(/\s+/g, " ").slice(0, 160).trim()
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getNewsBySlug(slug);
    const description = summarize(article);
    const url = absoluteUrl(`/news/${article.slug}`);
    const published = article.publishedAt ?? article.createdAt;
    return {
      title: article.title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: article.title,
        description,
        publishedTime: published,
        ...(article.thumbnail ? { images: [{ url: article.thumbnail }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description,
        ...(article.thumbnail ? { images: [article.thumbnail] } : {}),
      },
    };
  } catch {
    return { title: "Article not found" };
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: NewsArticle;
  try {
    article = await getNewsBySlug(slug);
  } catch {
    notFound();
  }

  const ads = await getActiveAdvertisements().catch(() => []);

  const published = article.publishedAt ?? article.createdAt;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: summarize(article),
    datePublished: published,
    dateModified: published,
    ...(article.thumbnail ? { image: [article.thumbnail] } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/news/${article.slug}`),
    },
    publisher: { "@type": "Organization", name: "MobileArena" },
  };

  return (
    <ArenaShell>
      <JsonLd data={jsonLd} />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: article.title },
        ]}
      />

      <GlassPanel className="p-6 md:p-10">
        {article.featured && (
          <span className="mb-3 inline-block rounded-full bg-[var(--premium-gold)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--premium-gold)]">
            Featured
          </span>
        )}

        <h1 className="text-3xl font-extrabold leading-tight text-[var(--text-primary)] md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {formatDate(article.publishedAt ?? article.createdAt)}
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
          className="prose prose-invert mt-8 max-w-none prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)]"
        />
      </GlassPanel>
    </ArenaShell>
  );
}
