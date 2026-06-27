"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Newspaper, Star, MessageSquare, Smartphone } from "lucide-react";

import {
  getAllNews,
  getReviews,
  getDevices,
  getComments,
} from "@/lib/api";

type Counts = {
  news: number;
  drafts: number;
  reviews: number;
  devices: number;
  comments: number;
};

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [news, reviews, devices, comments] = await Promise.all([
          getAllNews(),
          getReviews(),
          getDevices(),
          getComments(),
        ]);
        setCounts({
          news: news.length,
          drafts: news.filter((n) => n.status !== "PUBLISHED").length,
          reviews: reviews.length,
          devices: devices.length,
          comments: comments.length,
        });
      } catch {
        setError("Could not load stats. Is the API running?");
      }
    })();
  }, []);

  const cards = [
    {
      label: "News articles",
      value: counts?.news,
      sub: counts ? `${counts.drafts} unpublished` : "",
      icon: Newspaper,
      href: "/admin/news",
    },
    { label: "Reviews", value: counts?.reviews, icon: Star, href: "/admin/reviews" },
    {
      label: "Comments",
      value: counts?.comments,
      icon: MessageSquare,
      href: "/admin/comments",
    },
    { label: "Devices", value: counts?.devices, icon: Smartphone, href: "/phones" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage news, reviews and community comments.
      </p>

      {error && (
        <p className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <Icon size={18} className="text-red-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">
              {value ?? "—"}
            </div>
            {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          + New article
        </Link>
        <Link
          href="/admin/reviews/new"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-red-300"
        >
          + New review
        </Link>
      </div>
    </div>
  );
}
