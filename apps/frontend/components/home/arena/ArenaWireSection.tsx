"use client";

import { Link } from "@/i18n/navigation";

import { FormattedDate } from "@/components/ui/FormattedDate";
import {
  buildArenaWireLayout,
  inferArenaWireTopic,
} from "@/features/news/arena-wire";
import type { NewsArticle } from "@/lib/api";
import { useSiteLanguage } from "@/lib/site-language";

type ArenaWireSectionProps = {
  articles: NewsArticle[];
};

function TopicBadge({ article }: { article: NewsArticle }) {
  const topic = inferArenaWireTopic(article);
  return (
    <span className={`arena-wire-badge arena-wire-badge--${topic.tone}`}>
      {topic.label}
    </span>
  );
}

function ArticleThumb({
  article,
  className = "",
}: {
  article: NewsArticle;
  className?: string;
}) {
  return (
    <div className={`arena-wire-thumb ${className}`.trim()}>
      {article.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.thumbnail} alt="" className="object-cover" />
      ) : (
        <div className="arena-wire-thumb-fallback" aria-hidden>
          <span className="arena-wire-thumb-mark">M</span>
        </div>
      )}
    </div>
  );
}

function ArenaWireHero({
  article,
  deskLabel,
}: {
  article: NewsArticle;
  deskLabel: string;
}) {
  return (
    <Link href={`/news/${article.slug}`} className="arena-wire-hero group">
      <ArticleThumb article={article} className="arena-wire-hero-thumb" />
      <h3 className="arena-wire-hero-title">{article.title}</h3>
      <p className="arena-wire-hero-meta">
        <TopicBadge article={article} />
        <span className="arena-wire-hero-author">• {deskLabel}</span>
      </p>
    </Link>
  );
}

function ArenaWireStripCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.slug}`} className="arena-wire-strip-card group">
      <ArticleThumb article={article} className="arena-wire-strip-thumb" />
      <h4 className="arena-wire-strip-title">{article.title}</h4>
    </Link>
  );
}

function ArenaWireLatestItem({
  article,
  deskLabel,
}: {
  article: NewsArticle;
  deskLabel: string;
}) {
  return (
    <Link href={`/news/${article.slug}`} className="arena-wire-latest-item group">
      <ArticleThumb article={article} className="arena-wire-latest-thumb" />
      <div className="arena-wire-latest-copy">
        <h4 className="arena-wire-latest-title">{article.title}</h4>
        <p className="arena-wire-latest-meta">
          <TopicBadge article={article} />
          <span className="arena-wire-latest-author">• {deskLabel}</span>
          <span className="arena-wire-latest-dot" aria-hidden>
            •
          </span>
          <FormattedDate
            value={article.publishedAt ?? article.createdAt}
            variant="relative"
            className="arena-wire-latest-time"
          />
        </p>
      </div>
    </Link>
  );
}

export function ArenaWireSection({ articles }: ArenaWireSectionProps) {
  const { t } = useSiteLanguage();
  const { hero, mosaic, pulse } = buildArenaWireLayout(articles);
  const desk = t("home.arenaDesk");

  if (!hero) return null;

  return (
    <section aria-labelledby="arena-wire" className="arena-wire-section">
      <div className="arena-wire-band">
        <div className="arena-wire-inner">
          <h2 id="arena-wire" className="arena-wire-band-title">
            {t("home.featuredStories")}
          </h2>
          <div className="arena-wire-layout">
            <div className="arena-wire-main">
              <ArenaWireHero article={hero} deskLabel={desk} />
              {mosaic.length > 0 ? (
                <div className="arena-wire-strip">
                  {mosaic.map((article) => (
                    <ArenaWireStripCard key={article.id} article={article} />
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="arena-wire-rail" aria-labelledby="arena-wire-latest">
              <div className="arena-wire-rail-head">
                <h3 id="arena-wire-latest" className="arena-wire-rail-title">
                  {t("home.latestStories")}
                </h3>
                <Link href="/news" className="arena-wire-rail-more">
                  {t("home.moreNews")} &gt;
                </Link>
              </div>
              <div className="arena-wire-latest-list">
                {pulse.map((article) => (
                  <ArenaWireLatestItem
                    key={article.id}
                    article={article}
                    deskLabel={desk}
                  />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
