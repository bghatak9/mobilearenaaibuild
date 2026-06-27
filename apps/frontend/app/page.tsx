import Link from "next/link";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhoneFinderBox from "@/components/home/PhoneFinderBox";
import FeatureCard from "@/components/home/FeatureCard";
import {
  getDevices,
  getNews,
  getReviews,
  type Device,
  type NewsArticle,
  type Review,
} from "@/lib/api";

const GRADIENTS = [
  "bg-gradient-to-br from-teal-600 to-emerald-800",
  "bg-gradient-to-br from-rose-600 to-red-900",
  "bg-gradient-to-br from-amber-500 to-orange-700",
  "bg-gradient-to-br from-indigo-600 to-violet-900",
  "bg-gradient-to-br from-sky-600 to-blue-900",
  "bg-gradient-to-br from-fuchsia-600 to-purple-900",
];

type Item = {
  href: string;
  title: string;
  meta?: string;
  image?: string | null;
};

function fmt(value?: string | null): string {
  if (!value) return "";
  return new Date(value)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [news, reviews, devices] = await Promise.all([
    safe(getNews()),
    safe(getReviews()),
    safe(getDevices()),
  ]);

  const reviewItems: Item[] = (reviews ?? []).map((r: Review) => ({
    href: `/reviews/${r.slug}`,
    title: r.title,
    meta: fmt(r.publishedAt),
  }));

  const newsItems: Item[] = (news ?? []).map((n: NewsArticle) => ({
    href: `/news/${n.slug}`,
    title: n.title,
    meta: fmt(n.publishedAt ?? n.createdAt),
    image: n.thumbnail,
  }));

  const deviceItems: Item[] = (devices ?? []).map((d: Device) => ({
    href: `/phones/${d.slug}`,
    title: `${d.name} review`,
    meta: d.brand?.name?.toUpperCase(),
    image: d.images?.[0]?.url,
  }));

  const pool = [...reviewItems, ...newsItems, ...deviceItems];
  const hero = reviewItems[0] ?? pool[0] ?? null;
  const rest = pool.filter((i) => i.href !== hero?.href);
  const rightCol = rest.slice(0, 2);
  const bottom = rest.slice(2, 5);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 py-5">
        {/* Ad */}
        <div className="mb-5">
          <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-gray-400">
            Advertisement
          </p>
          <div className="flex h-24 items-center justify-center rounded border border-gray-200 bg-white text-sm text-gray-300">
            Ad
          </div>
        </div>

        {/* Finder · Hero · Reviews */}
        <div className="grid gap-4 lg:grid-cols-[230px_1fr_330px]">
          <PhoneFinderBox />

          <div>
            {hero ? (
              <FeatureCard
                size="hero"
                href={hero.href}
                title={hero.title}
                meta={hero.meta}
                image={hero.image}
                gradient={GRADIENTS[0]}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400">
                No featured content yet
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {rightCol.length > 0 ? (
              rightCol.map((item, i) => (
                <FeatureCard
                  key={item.href}
                  size="md"
                  href={item.href}
                  title={item.title}
                  meta={item.meta}
                  image={item.image}
                  gradient={GRADIENTS[(i + 1) % GRADIENTS.length]}
                />
              ))
            ) : (
              <div className="flex h-[150px] items-center justify-center rounded-md border border-gray-200 bg-white text-sm text-gray-400">
                More reviews soon
              </div>
            )}
            <Link
              href="/reviews"
              className="rounded border border-gray-200 bg-white py-2 text-center text-xs font-semibold text-zinc-600 hover:text-red-600"
            >
              ALL REVIEWS
            </Link>
          </div>
        </div>

        {/* Ad banner · News cards */}
        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <div className="flex h-[220px] flex-col items-start justify-center gap-3 rounded-md bg-gradient-to-br from-amber-300 to-yellow-200 p-5">
            <span className="text-[10px] uppercase text-amber-700">
              Advertisement
            </span>
            <p className="text-xl font-extrabold text-amber-900">
              Smooth-sailing through 20+ apps.
            </p>
            <span className="rounded bg-red-600 px-4 py-1.5 text-sm font-semibold text-white">
              Buy now
            </span>
          </div>

          {bottom.length > 0 ? (
            bottom.map((item, i) => (
              <FeatureCard
                key={item.href}
                size="sm"
                href={item.href}
                title={item.title}
                meta={item.meta}
                image={item.image}
                gradient={GRADIENTS[(i + 3) % GRADIENTS.length]}
              />
            ))
          ) : (
            <div className="col-span-3 flex h-[220px] items-center justify-center rounded-md border border-gray-200 bg-white text-sm text-gray-400">
              More stories soon
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
