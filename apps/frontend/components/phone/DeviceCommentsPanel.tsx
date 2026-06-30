"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Pencil, Trash2 } from "lucide-react";

import { Avatar } from "@/design-system/feedback/Avatar";
import { Button } from "@/design-system/buttons/Button";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import {
  createComment,
  deleteComment,
  getDeviceComments,
  reportContent,
  updateComment,
  type DeviceComment,
} from "@/lib/api";
import { getToken } from "@/lib/api";
import { useSiteAuth } from "@/lib/site-auth";

export function DeviceCommentsPanel({
  deviceId,
  deviceName,
}: {
  deviceId: number;
  deviceName: string;
}) {
  const [comments, setComments] = useState<DeviceComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user } = useSiteAuth();

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
    getDeviceComments(deviceId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [deviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      setError("Sign in to comment.");
      return;
    }
    setPosting(true);
    setError(null);
    setNotice(null);
    try {
      const created = await createComment({ deviceId, body: body.trim() });
      if (created.visible !== false) {
        setComments((prev) => [created, ...prev]);
      }
      setBody("");
      if (created.moderationMessage) {
        setNotice(created.moderationMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setPosting(false);
    }
  }

  async function handleReport(commentId: number) {
    if (!loggedIn) {
      setError("Sign in to report content.");
      return;
    }
    const reason = window.prompt("Why are you reporting this comment?");
    if (!reason?.trim()) return;
    try {
      await reportContent({
        entityType: "COMMENT",
        entityId: commentId,
        reason: reason.trim(),
      });
      setError("Report submitted. Moderators will review it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report failed");
    }
  }

  function startEdit(comment: DeviceComment) {
    setEditingId(comment.id);
    setDraftBody(comment.body);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftBody("");
  }

  async function saveEdit(id: number) {
    const body = draftBody.trim();
    if (!body) {
      setError("Comment cannot be empty.");
      return;
    }
    setSavingId(id);
    setError(null);
    try {
      const updated = await updateComment(id, body);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, body: updated.body } : c)),
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save comment");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete comment");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <GlassPanel className="mt-8 p-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Community comments
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Share your take on {deviceName}
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={loggedIn ? "Write a comment…" : "Sign in to comment"}
          disabled={!loggedIn || posting}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!body.trim() || posting || !loggedIn}>
            {posting ? "Posting…" : "Post comment"}
          </Button>
          {!loggedIn && (
            <Link href="/login" className="text-sm text-[var(--electric-cyan)] hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </form>

      {notice && (
        <p className="mt-3 text-sm text-amber-600">{notice}</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-[var(--rose-alert)]">{error}</p>
      )}

      <ul className="mt-6 space-y-4">
        {loading ? (
          <li className="text-sm text-[var(--text-secondary)]">Loading comments…</li>
        ) : comments.length === 0 ? (
          <li className="text-sm text-[var(--text-secondary)]">
            No comments yet — be the first.
          </li>
        ) : (
          comments.map((c) => {
            const isOwn = user?.id != null && c.user?.id === user.id;
            const isEditing = editingId === c.id;
            const isSaving = savingId === c.id;
            const isDeleting = deletingId === c.id;

            return (
            <li
              key={c.id}
              className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <Avatar src={c.user?.avatar} name={c.user?.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {c.user?.name ?? "Arena member"}
                  {isOwn && (
                    <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">
                      (you)
                    </span>
                  )}
                </p>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      disabled={isSaving}
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        disabled={isSaving || !draftBody.trim()}
                        onClick={() => void saveEdit(c.id)}
                      >
                        {isSaving ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSaving}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{c.body}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <time dateTime={c.createdAt}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </time>
                  {isOwn && !isEditing && (
                    <>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => startEdit(c)}
                        className="inline-flex items-center gap-1 hover:text-[var(--electric-cyan)] disabled:opacity-50"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => void handleDelete(c.id)}
                        className="inline-flex items-center gap-1 hover:text-[var(--rose-alert)] disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </>
                  )}
                  {!isOwn && (
                    <button
                      type="button"
                      onClick={() => void handleReport(c.id)}
                      className="inline-flex items-center gap-1 hover:text-[var(--rose-alert)]"
                    >
                      <Flag size={12} />
                      Report
                    </button>
                  )}
                </div>
              </div>
            </li>
            );
          })
        )}
      </ul>
    </GlassPanel>
  );
}
