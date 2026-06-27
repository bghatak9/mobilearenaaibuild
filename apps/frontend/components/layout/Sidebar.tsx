"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDevices, getNews, type Device, type NewsArticle } from "@/lib/api";

export default function Sidebar() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [trending, setTrending] = useState<Device[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    getNews()
      .then((data) => setNews(data.slice(0, 5)))
      .catch(() => {});

    getDevices()
      .then((data) => {
        setTrending(
          [...data]
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 5),
        );
        setBrands(
          Array.from(
            new Set(data.map((d) => d.brand?.name).filter(Boolean) as string[]),
          ).slice(0, 8),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-bold text-gray-900">Latest News</h2>
        {news.length === 0 ? (
          <p className="text-sm text-gray-400">No news yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {news.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/news/${n.slug}`}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-bold text-gray-900">Trending Phones</h2>
        {trending.length === 0 ? (
          <p className="text-sm text-gray-400">No phones yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {trending.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/phones/${d.slug}`}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-bold text-gray-900">Popular Brands</h2>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <Link
              key={b}
              href="/phones"
              className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-indigo-400"
            >
              {b}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
