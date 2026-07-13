"use client";

import { formatDateTime } from "@/lib/format-datetime";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import {
  getMyComments,
  deleteComment,
  updateComment,
  type ProfileComment,
} from "@/lib/api";

function commentStatusLabel(status?: string) {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending review";
    case "HIDDEN":
      return "Hidden — under review";
    case "SPAM":
      return "Rejected as spam";
    case "REMOVED":
      return "Removed";
    case "APPROVED":
    case "PUBLISHED":
      return "Published";
    default:
      return null;
  }
}

export default function CommentsPage() {
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    getMyComments()
      .then(setComments)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  function startEdit(comment: ProfileComment) {
    setEditingId(comment.id);
    setDraftBody(comment.body);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftBody("");
    setEditError(null);
  }

  async function saveEdit(id: number) {
    const body = draftBody.trim();
    if (!body) {
      setEditError("Comment cannot be empty.");
      return;
    }
    setSavingId(id);
    setEditError(null);
    try {
      await updateComment(id, body);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, body } : c)),
      );
      cancelEdit();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not save comment",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    setDeletingId(id);
    setEditError(null);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not delete comment",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;

  return (
    <>
      <ProfilePageHeader
        title="My Comments"
        description="All comments you've posted on devices."
      />
      <ProfilePanel>
        {editError && !editingId && (
          <p className="mb-4 text-sm text-red-600">{editError}</p>
        )}
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            You haven&apos;t posted any comments yet.
          </p>
        ) : (
          <SwipePagedList
            items={comments}
            getKey={(c) => c.id}
            as="ul"
            wrapperClassName="divide-y divide-gray-100 dark:divide-zinc-800"
            renderItem={(c) => {
              const isEditing = editingId === c.id;
              const isSaving = savingId === c.id;
              const isDeleting = deletingId === c.id;

              return (
                <li className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/phones/${c.device.slug}`}
                      className="font-medium text-red-600 hover:underline"
                    >
                      {c.device.name}
                    </Link>
                    {!isEditing && (
                      <div className="flex shrink-0 gap-3">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => startEdit(c)}
                          className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => void handleDelete(c.id)}
                          className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        disabled={isSaving}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      />
                      {editError && (
                        <p className="text-sm text-red-600">{editError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSaving || !draftBody.trim()}
                          onClick={() => void saveEdit(c.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={cancelEdit}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {c.body}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(c.createdAt)}
                    {c.status && commentStatusLabel(c.status) && (
                      <> · {commentStatusLabel(c.status)}</>
                    )}
                    {c.spamScore != null && c.spamScore > 0 && (
                      <> · spam score {c.spamScore}</>
                    )}
                  </p>
                </li>
              );
            }}
          />
        )}
      </ProfilePanel>
    </>
  );
}
