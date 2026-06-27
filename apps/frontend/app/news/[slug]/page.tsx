import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { getNewsBySlug, type NewsArticle } from "@/lib/api";

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
    publisher: {
      "@type": "Organization",
      name: "MobileArena",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <JsonLd data={jsonLd} />
      <Header />

      <article className="mx-auto max-w-3xl px-5 py-10">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/news" className="hover:underline">
            News
          </Link>{" "}
          / <span className="text-gray-700">{article.title}</span>
        </nav>

        {article.featured && (
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            Featured
          </span>
        )}

        <h1 className="text-4xl font-bold leading-tight text-gray-900">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {formatDate(article.publishedAt ?? article.createdAt)}
        </p>

        {article.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail}
            alt={article.title}
            className="mt-6 w-full rounded-2xl object-cover"
          />
        )}

        <div className="prose mt-8 max-w-none whitespace-pre-wrap text-gray-800">
          {article.content}
        </div>
      </article>

      <Footer />
    </div>
  );
}
