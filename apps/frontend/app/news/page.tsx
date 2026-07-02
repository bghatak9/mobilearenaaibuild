import type { Metadata } from "next";

import { NewsList } from "@/components/news/NewsList";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { getNews, type NewsArticle } from "@/lib/api";

export const metadata: Metadata = {
  title: "News",
};

export default async function NewsPage() {
  let news: NewsArticle[] = [];
  let error = false;
  try {
    news = await getNews();
  } catch {
    error = true;
  }

  return (
    <ArenaShell>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          News
        </h1>
      </header>

      {error ? (
        <p className="text-red-400">Couldn&apos;t load news. Is the API running?</p>
      ) : (
        <NewsList articles={news} />
      )}
    </ArenaShell>
  );
}
