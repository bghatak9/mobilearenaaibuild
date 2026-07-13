import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewsList } from "@/components/news/NewsList";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { getNews, type NewsArticle } from "@/lib/api";
import { absoluteUrl, localeAlternateLanguages } from "@/lib/seo";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: t("title"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/news`),
      languages: localeAlternateLanguages("/news", UNIQUE_APP_LOCALES),
    },
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  let news: NewsArticle[] = [];
  let error = false;
  try {
    news = await getNews({ locale });
  } catch {
    error = true;
  }

  return (
    <ArenaShell>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          {t("title")}
        </h1>
      </header>

      {error ? (
        <p className="text-red-400">{t("loadError")}</p>
      ) : (
        <NewsList articles={news} />
      )}
    </ArenaShell>
  );
}
