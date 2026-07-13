"use client";

import { Link } from "@/i18n/navigation";

import { SwipePagedList } from "@/components/ui/SwipePagedList";
import type { NewsArticle, Review } from "@/lib/api";

type EditorialItem = {
  href: string;
  title: string;
  type: "Review" | "News";
};

export function EditorsArenaSwipe({
  reviews,
  news,
}: {
  reviews: Review[];
  news: NewsArticle[];
}) {
  const items: EditorialItem[] = [
    ...reviews.map((r) => ({
      href: `/reviews/${r.slug}`,
      title: r.title,
      type: "Review" as const,
    })),
    ...news.map((n) => ({
      href: `/news/${n.slug}`,
      title: n.title,
      type: "News" as const,
    })),
  ];

  if (!items.length) return null;

  return (
    <SwipePagedList
      items={items}
      getKey={(item) => item.href}
      listClassName="grid gap-4 md:grid-cols-2"
      pageSize={4}
      renderItem={(item) => (
        <Link
          href={item.href}
          className="arena-editorial-card group flex items-start gap-4 p-5"
        >
          <span
            className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              item.type === "Review"
                ? "border-[var(--border-accent-gold)] bg-[var(--premium-gold)]/15 text-[var(--premium-gold)]"
                : "border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]"
            }`}
          >
            {item.type}
          </span>
          <p className="flex-1 font-semibold leading-snug text-[var(--text-primary)] transition group-hover:text-[var(--electric-cyan)]">
            {item.title}
          </p>
        </Link>
      )}
    />
  );
}
