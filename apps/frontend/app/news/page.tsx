import Link from "next/link";
import type { Metadata } from "next";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { getCatalogStatus, getNews, type NewsArticle } from "@/lib/api";

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const metadata: Metadata = {
  title: "News",
};

export default async function NewsPage() {
  const catalog = await getCatalogStatus();
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
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Latest stories, launches, and updates from the mobile world.
        </p>
      </header>

      {error ? (
        <p className="text-red-400">Couldn&apos;t load news. Is the API running?</p>
      ) : news.length === 0 ? (
        <GlassPanel className="p-8 text-center text-[var(--text-secondary)]">
          {catalog.importedOnly
            ? "No uploaded articles yet. Upload news via Admin → Bulk Upload."
            : "No published articles yet."}
        </GlassPanel>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`} className="group">
              <GlassPanel className="flex h-full flex-col overflow-hidden p-0 transition duration-200 hover:border-[var(--electric-cyan)]/30">
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[var(--arena-blue)]/10 to-[var(--aurora-purple)]/10">
                  {article.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">MobileArena</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {article.featured && (
                    <span className="mb-2 w-fit rounded-full bg-[var(--premium-gold)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--premium-gold)]">
                      Featured
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--electric-cyan)]">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
                      {article.excerpt}
                    </p>
                  )}
                  <p className="mt-auto pt-3 text-xs text-[var(--text-secondary)]">
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </p>
                </div>
              </GlassPanel>
            </Link>
          ))}
        </div>
      )}
    </ArenaShell>
  );
}
