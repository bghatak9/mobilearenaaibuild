import type { MetadataRoute } from "next";

import { getNews } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { ENABLED_LOCALES, getLocaleMeta, isEnabledLocale } from "@/i18n/locales";

async function safeNews(locale: string) {
  try {
    return await getNews({ locale, status: "PUBLISHED" });
  } catch {
    return [];
  }
}

/**
 * Locale-aware RSS.
 * Use `?locale=hi` (or Accept-Language via clients) for translated titles/slugs.
 * Default feed remains English with hreflang alternates.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("locale") ?? url.searchParams.get("lang") ?? "en";
  const locale = isEnabledLocale(requested) ? requested : "en";
  const articles = await safeNews(locale);
  const items = articles.slice(0, 40);
  const meta = getLocaleMeta(locale);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} News</title>
    <link>${SITE_URL}/${locale}/news</link>
    <description>Latest smartphone news from ${escapeXml(SITE_NAME)}</description>
    <language>${meta.bcp47}</language>
    <atom:link href="${SITE_URL}/rss.xml?locale=${locale}" rel="self" type="application/rss+xml"/>
    ${ENABLED_LOCALES.map(
      (loc) =>
        `<atom:link href="${SITE_URL}/rss.xml?locale=${loc}" rel="alternate" hreflang="${getLocaleMeta(loc).bcp47}"/>`,
    ).join("\n    ")}
    ${items
      .map((a) => {
        const link = `${SITE_URL}/${locale}/news/${a.slug}`;
        const pub = a.publishedAt ?? a.createdAt;
        return `<item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(a.excerpt ?? a.seoDescription ?? "")}</description>
      ${pub ? `<pubDate>${new Date(pub).toUTCString()}</pubDate>` : ""}
    </item>`;
      })
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type { MetadataRoute };
