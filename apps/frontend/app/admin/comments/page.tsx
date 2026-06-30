"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Flag,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import {
  bulkModerateComments,
  deleteComment,
  getCommentAiSpamStatus,
  getCommentModerationAudit,
  getCommentModerationQueue,
  getCommentModerationStats,
  getComments,
  getOpenReports,
  moderateComment,
  reviewReport,
  type Comment,
  type CommentAiSpamStatus,
  type CommentAuditLog,
  type CommentModerationStats,
  type CommentStatus,
  type ContentReport,
} from "@/lib/api";

type Tab = "queue" | "all" | "spam" | "reported" | "audit";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusBadge(status?: CommentStatus) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    PENDING_REVIEW: "bg-amber-50 text-amber-700",
    HIDDEN: "bg-orange-50 text-orange-700",
    SPAM: "bg-rose-50 text-rose-700",
    REMOVED: "bg-gray-100 text-gray-600",
  };
  const label = status?.replace(/_/g, " ") ?? "UNKNOWN";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status ?? ""] ?? "bg-gray-100 text-gray-600"}`}
    >
      {label}
    </span>
  );
}

export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>("queue");
  const [items, setItems] = useState<Comment[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [audit, setAudit] = useState<CommentAuditLog[]>([]);
  const [stats, setStats] = useState<CommentModerationStats | null>(null);
  const [aiStatus, setAiStatus] = useState<CommentAiSpamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, aiData] = await Promise.all([
        getCommentModerationStats(),
        getOpenReports(),
        getCommentAiSpamStatus(),
      ]);
      setStats(statsData);
      setAiStatus(aiData);
      setReports(reportsData.filter((r) => r.entityType === "COMMENT"));

      if (tab === "queue") {
        setItems(await getCommentModerationQueue());
      } else if (tab === "spam") {
        setItems(await getCommentModerationQueue("SPAM"));
      } else if (tab === "all") {
        setItems(await getComments());
      } else if (tab === "audit") {
        setAudit(await getCommentModerationAudit(80));
        setItems([]);
      } else {
        setItems([]);
      }
      setError(null);
    } catch {
      setError("Failed to load moderation data.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.body.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q) ||
        c.device?.name?.toLowerCase().includes(q),
    );
  }, [items, search]);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(action: "approve" | "reject" | "spam") {
    if (selected.size === 0) return;
    if (!confirm(`${action} ${selected.size} comment(s)?`)) return;
    setBusy(true);
    try {
      await bulkModerateComments([...selected], action);
      setSelected(new Set());
      await load();
    } catch {
      alert("Bulk action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleModerate(
    comment: Comment,
    action: "approve" | "reject" | "spam",
  ) {
    setBusy(true);
    try {
      if (action === "reject" && tab === "all") {
        await deleteComment(comment.id);
      } else {
        await moderateComment(comment.id, action);
      }
      setItems((prev) => prev.filter((c) => c.id !== comment.id));
      await load();
    } catch {
      alert("Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReportReview(
    report: ContentReport,
    status: "REVIEWED" | "DISMISSED",
  ) {
    setBusy(true);
    try {
      await reviewReport(report.id, status);
      if (status === "REVIEWED" && report.entityType === "COMMENT") {
        await moderateComment(report.entityId, "reject");
      }
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      await load();
    } catch {
      alert("Could not review report.");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "queue", label: "Review queue", count: stats?.pending },
    { id: "spam", label: "Spam", count: stats?.spam },
    { id: "reported", label: "Reported", count: stats?.reported },
    { id: "all", label: "All comments" },
    { id: "audit", label: "Audit logs" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Comment moderation
          </h1>
          <p className="text-sm text-gray-500">
            Auto spam detection, AI scoring, review queue, reports, and audit logs.
          </p>
          {aiStatus && (
            <p className="mt-1 text-xs text-gray-400">
              AI spam:{" "}
              {aiStatus.configured ? (
                <span className="font-medium text-emerald-600">
                  active ({aiStatus.model}, remove ≥{aiStatus.autoRemoveThreshold})
                </span>
              ) : (
                <span className="text-amber-600">inactive — set OPENAI_API_KEY</span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || busy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Pending review", value: stats.pending, icon: ShieldAlert },
            { label: "AI removed today", value: stats.aiRemovedToday, icon: Trash2 },
            { label: "Published", value: stats.published, icon: Check },
            { label: "Open reports", value: stats.reported, icon: Flag },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Icon size={14} />
                {label}
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSelected(new Set());
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab !== "audit" && tab !== "reported" && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments, users, devices…"
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void runBulk("approve")}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Approve ({selected.size})
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runBulk("reject")}
                className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-white"
              >
                Reject ({selected.size})
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runBulk("spam")}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Mark spam ({selected.size})
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : tab === "reported" ? (
        reports.length === 0 ? (
          <p className="text-gray-400">No open comment reports.</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <p className="text-sm text-gray-800">{r.reason}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Comment #{r.entityId} · reported by {r.reporter?.email ?? "user"} ·{" "}
                  {timeAgo(r.createdAt)}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReportReview(r, "REVIEWED")}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Remove comment
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReportReview(r, "DISMISSED")}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : tab === "audit" ? (
        audit.length === 0 ? (
          <p className="text-gray-400">No moderation audit logs yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {audit.map((log) => (
              <li key={log.id} className="px-4 py-3 text-sm">
                <span className="font-medium text-gray-800">{log.action}</span>
                <span className="text-gray-500">
                  {" "}
                  · {log.entity}
                  {log.entityId ? ` #${log.entityId}` : ""} ·{" "}
                  {log.user?.email ?? "system"} · {timeAgo(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No comments in this view.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => toggleSelect(c.id)}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {statusBadge(c.status)}
                  {c.spamScore != null && c.spamScore > 0 && (
                    <span className="text-[10px] font-semibold uppercase text-rose-500">
                      Score {c.spamScore}
                    </span>
                  )}
                  {c.aiSpamScore != null && c.aiSpamScore > 0 && (
                    <span className="text-[10px] font-semibold uppercase text-violet-600">
                      AI {c.aiSpamScore}
                    </span>
                  )}
                </div>
                <p className="text-gray-800">{c.body}</p>
                {c.spamReason && (
                  <p className="mt-1 text-xs text-amber-600">{c.spamReason}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {c.user?.email ?? "anonymous"}
                  {c.user?.reputationPoints != null
                    ? ` · ${c.user.reputationPoints} rep`
                    : ""}
                  {c.device ? ` · on ${c.device.name}` : ""} · {timeAgo(c.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleModerate(c, "approve")}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleModerate(c, "reject")}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  <X size={12} /> Reject
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleModerate(c, "spam")}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={12} /> Spam
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
