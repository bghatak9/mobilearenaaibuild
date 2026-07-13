"use client";

import { Link } from "@/i18n/navigation";

import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { FormattedDate } from "@/components/ui/FormattedDate";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import type { NewsArticle } from "@/lib/api";

export function NewsList({ articles }: { articles: NewsArticle[] }) {
  return (
    <>
      <SwipePagedList
      items={articles}
      getKey={(article) => article.id}
      listClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      renderItem={(article) => (
        <Link href={`/news/${article.slug}`} className="group">
          <SpectrumPanel className="flex h-full flex-col overflow-hidden p-0 transition duration-200 hover:border-[var(--electric-cyan)]/30">
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
                <FormattedDate
                  value={article.publishedAt ?? article.createdAt}
                  variant="long"
                />
              </p>
            </div>
          </SpectrumPanel>
        </Link>
      )}
    />
    </>
  );
}
