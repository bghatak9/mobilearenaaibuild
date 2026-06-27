"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { getComments, deleteComment, type Comment } from "@/lib/api";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ModerationPage() {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getComments());
      setError(null);
    } catch {
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(comment: Comment) {
    if (!confirm("Remove this comment?")) return;
    try {
      await deleteComment(comment.id);
      setItems((prev) => prev.filter((c) => c.id !== comment.id));
    } catch {
      alert("Delete failed.");
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Moderation</h1>
      <p className="mb-6 text-sm text-gray-500">
        Review and remove user comments across all devices.
      </p>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">No comments to moderate.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="text-gray-800">{c.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {c.user?.email ?? "anonymous"}
                  {c.device ? ` · on ${c.device.name}` : ""} ·{" "}
                  {timeAgo(c.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={13} /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
