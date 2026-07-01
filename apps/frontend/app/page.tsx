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
import { Button, Container, HERO_GRADIENTS } from "@mobilearena/ui";

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
    <div className="min-h-screen bg-bg-primary pb-24">
      <Header />

      <main>
        <Container className="py-5">
          <div className="mb-5">
            <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-text-muted">
              Advertisement
            </p>
            <div className="flex h-24 items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-surface-1 text-sm text-text-muted">
              Ad
            </div>
          </div>

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
                  gradient={HERO_GRADIENTS[0]}
                  premium
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-surface-1 text-text-muted">
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
                    gradient={HERO_GRADIENTS[(i + 1) % HERO_GRADIENTS.length]}
                  />
                ))
              ) : (
                <div className="flex h-[150px] items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-surface-1 text-sm text-text-muted">
                  More reviews soon
                </div>
              )}
              <Link
                href="/reviews"
                className="rounded-[var(--radius-button)] border border-border-soft bg-surface-1 py-2 text-center text-xs font-semibold text-text-secondary transition hover:text-blue"
              >
                ALL REVIEWS
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            <div className="titan-gradient-cosmic flex h-[220px] flex-col items-start justify-center gap-3 rounded-[var(--radius-card)] p-5">
              <span className="titan-badge-premium">Advertisement</span>
              <p className="titan-display text-xl text-text-primary">
                Smooth-sailing through 20+ apps.
              </p>
              <Button variant="primary">Buy now</Button>
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
                  gradient={HERO_GRADIENTS[(i + 2) % HERO_GRADIENTS.length]}
                />
              ))
            ) : (
              <div className="col-span-3 flex h-[220px] items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-surface-1 text-sm text-text-muted">
                More stories soon
              </div>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
