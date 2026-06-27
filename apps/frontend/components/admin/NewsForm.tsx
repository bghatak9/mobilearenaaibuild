"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { NewsArticle, NewsInput } from "@/lib/api";

const STATUSES: NewsArticle["status"][] = ["DRAFT", "REVIEW", "PUBLISHED"];

export default function NewsForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}: {
  initial?: Partial<NewsArticle>;
  onSubmit: (input: NewsInput) => Promise<void>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState<NewsArticle["status"]>(
    initial?.status ?? "DRAFT",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        title,
        content,
        excerpt: excerpt || undefined,
        thumbnail: thumbnail || undefined,
        status,
        featured,
      });
      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Save failed. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";
  const labelCls = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <label className={labelCls}>
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
      </label>

      <label className={labelCls}>
        Excerpt
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={field}
          placeholder="Short summary shown in lists"
        />
      </label>

      <label className={labelCls}>
        Thumbnail URL
        <input
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className={field}
          placeholder="https://…"
        />
      </label>

      <label className={labelCls}>
        Content
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className={field}
        />
      </label>

      <div className="flex flex-wrap items-end gap-6">
        <label className={labelCls}>
          Status
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as NewsArticle["status"])
            }
            className={field}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          Featured
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
