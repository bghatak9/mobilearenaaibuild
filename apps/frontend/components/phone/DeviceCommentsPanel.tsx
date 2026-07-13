"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Flag, Pencil, Trash2 } from "lucide-react";

import { Avatar } from "@/design-system/feedback/Avatar";
import { Button } from "@/design-system/buttons/Button";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { TechnicalText } from "@/components/i18n/TechnicalText";
import { DeviceName } from "@/components/brands/DeviceName";
import {
  DEVICE_DISCUSSIONS_SECTION_ID,
  discussionTopicLabel,
} from "@/features/device-intelligence";
import { localizeTechnicalText } from "@/features/i18n";
import {
  createComment,
  deleteComment,
  getDeviceComments,
  reportContent,
  updateComment,
  type DeviceComment,
} from "@/lib/api";
import { formatDate } from "@/lib/format-datetime";
import { getToken } from "@/lib/api";
import { useSiteAuth } from "@/lib/site-auth";
import { useSiteLanguage } from "@/lib/site-language";

export function DeviceCommentsPanel({
  deviceId,
  deviceName,
  deviceBrand,
}: {
  deviceId: number;
  deviceName: string;
  deviceBrand?: string | null;
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
  const { resolved } = useSiteLanguage();
  const tPhones = useTranslations("phones");
  const searchParams = useSearchParams();
  const activeTopic = discussionTopicLabel(searchParams.get("topic"));
  const commentPlaceholder = loggedIn
    ? activeTopic
      ? localizeTechnicalText(
          `Share your ${activeTopic.toLowerCase()} experience…`,
          resolved,
        )
      : tPhones("writeComment")
    : localizeTechnicalText("Sign in to comment", resolved);

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
    <SpectrumPanel
      id={DEVICE_DISCUSSIONS_SECTION_ID}
      className="mt-8 scroll-mt-28 p-6"
    >
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        <TechnicalText value="Community comments" />
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {activeTopic ? (
          <>
            <TechnicalText value="Join the" />{" "}
            <TechnicalText value={activeTopic.toLowerCase()} />{" "}
            <TechnicalText value="discussion about" />{" "}
            <DeviceName name={deviceName} brand={deviceBrand} />
          </>
        ) : (
          <>
            <TechnicalText value="Share your take on" />{" "}
            <DeviceName name={deviceName} brand={deviceBrand} />
          </>
        )}
      </p>

      {activeTopic ? (
        <p className="mt-3 inline-flex items-center rounded-full border border-[var(--electric-cyan)]/30 bg-[var(--electric-cyan)]/10 px-3 py-1 text-xs font-semibold text-[var(--electric-cyan)]">
          <TechnicalText value={`Topic: ${activeTopic}`} />
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={commentPlaceholder}
          disabled={!loggedIn || posting}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!body.trim() || posting || !loggedIn}>
            <TechnicalText value={posting ? "Posting…" : "Post comment"} />
          </Button>
          {!loggedIn && (
            <Link href="/login" className="text-sm text-[var(--electric-cyan)] hover:underline">
              <TechnicalText value="Sign in" />
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
          <li className="text-sm text-[var(--text-secondary)]">
            <TechnicalText value="Loading comments…" />
          </li>
        ) : comments.length === 0 ? (
          <li className="text-sm text-[var(--text-secondary)]">
            <TechnicalText value={tPhones("noComments")} />
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
                  {c.user?.name ?? (
                    <TechnicalText value="Arena member" />
                  )}
                  {isOwn && (
                    <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">
                      <TechnicalText value="(you)" />
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
                        <TechnicalText value={isSaving ? "Saving…" : "Save"} />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSaving}
                        onClick={cancelEdit}
                      >
                        <TechnicalText value="Cancel" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{c.body}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <time dateTime={c.createdAt}>{formatDate(c.createdAt)}</time>
                  {isOwn && !isEditing && (
                    <>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => startEdit(c)}
                        className="inline-flex items-center gap-1 hover:text-[var(--electric-cyan)] disabled:opacity-50"
                      >
                        <Pencil size={12} />
                        <TechnicalText value="Edit" />
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => void handleDelete(c.id)}
                        className="inline-flex items-center gap-1 hover:text-[var(--rose-alert)] disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        <TechnicalText value={isDeleting ? "Deleting…" : "Delete"} />
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
                      <TechnicalText value="Report" />
                    </button>
                  )}
                </div>
              </div>
            </li>
            );
          })
        )}
      </ul>
    </SpectrumPanel>
  );
}
