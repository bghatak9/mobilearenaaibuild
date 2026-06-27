"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RoleGate } from "@/components/admin/RoleGate";
import { getAllNews, getReviews, type NewsArticle, type Review } from "@/lib/api";

export default function ArticlesPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllNews(), getReviews()])
      .then(([n, r]) => {
        setNews(n);
        setReviews(r);
      })
      .catch(() => setError("Could not load articles."));
  }, []);

  const drafts = news.filter((n) => n.status !== "PUBLISHED");

  return (
    <RoleGate allowed={["EDITOR", "AUTHOR"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Articles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Draft news and reviews awaiting publish.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">News drafts</h2>
              <Link
                href="/admin/news/new"
                className="text-xs font-medium text-red-600 hover:underline"
              >
                + New
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              {drafts.length === 0 && (
                <li className="text-gray-400">No drafts</li>
              )}
              {drafts.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/news/${item.slug}`}
                    className="text-zinc-800 hover:text-red-600"
                  >
                    {item.title}
                  </Link>
                  <span className="ml-2 text-xs text-gray-400">
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Reviews</h2>
              <Link
                href="/admin/reviews/new"
                className="text-xs font-medium text-red-600 hover:underline"
              >
                + New
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              {reviews.length === 0 && (
                <li className="text-gray-400">No reviews yet</li>
              )}
              {reviews.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/reviews/${item.slug}`}
                    className="text-zinc-800 hover:text-red-600"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </RoleGate>
  );
}
