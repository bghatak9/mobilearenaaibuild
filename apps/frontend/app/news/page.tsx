import Link from "next/link";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getNews, type NewsArticle } from "@/lib/api";

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsPage() {
  let news: NewsArticle[] = [];
  let error = false;
  try {
    news = await getNews();
  } catch {
    error = true;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Mobile News</h1>

        {error ? (
          <p className="text-red-500">Couldn&apos;t load news. Is the API running?</p>
        ) : news.length === 0 ? (
          <p className="text-gray-500">No published articles yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-gray-100">
                  {article.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">MobileArena</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {article.featured && (
                    <span className="mb-2 w-fit rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      Featured
                    </span>
                  )}
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {article.excerpt}
                    </p>
                  )}
                  <p className="mt-auto pt-3 text-xs text-gray-400">
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
