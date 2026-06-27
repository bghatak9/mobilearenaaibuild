"use client";

import { use, useEffect, useState } from "react";
import NewsForm from "@/components/admin/NewsForm";
import { getNewsBySlug, updateNews, type NewsArticle } from "@/lib/api";

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setArticle(await getNewsBySlug(slug));
      } catch {
        setError("Article not found.");
      }
    })();
  }, [slug]);

  if (error) return <div className="p-8 text-rose-600">{error}</div>;
  if (!article) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit article</h1>
      <NewsForm
        initial={article}
        submitLabel="Save changes"
        onSubmit={async (input) => {
          await updateNews(article.id, input);
        }}
      />
    </div>
  );
}
