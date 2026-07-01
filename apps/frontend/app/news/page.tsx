import Link from "next/link";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getNews, type NewsArticle } from "@/lib/api";
import { Badge, Card, Container } from "@mobilearena/ui";

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
    <div className="min-h-screen bg-bg-primary pb-24">
      <Header />

      <section>
        <Container wide className="py-8">
          <h1 className="titan-display mb-8 text-3xl">Mobile News</h1>

          {error ? (
            <p className="text-danger">Couldn&apos;t load news. Is the API running?</p>
          ) : news.length === 0 ? (
            <p className="text-text-muted">No published articles yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group">
                  <Card interactive className="flex h-full flex-col overflow-hidden p-0">
                    <div className="flex h-40 items-center justify-center bg-surface-2">
                      {article.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-text-muted">MobileArena</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      {article.featured && (
                        <Badge premium className="mb-2 w-fit">
                          Featured
                        </Badge>
                      )}
                      <h2 className="text-lg font-semibold text-text-primary group-hover:text-blue transition">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm text-text-secondary">
                          {article.excerpt}
                        </p>
                      )}
                      <p className="mt-auto pt-3 text-xs text-text-muted">
                        {formatDate(article.publishedAt ?? article.createdAt)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </div>
  );
}
