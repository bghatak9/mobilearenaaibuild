"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import {
  clearAllNotifications,
  deleteNotification,
  getProfileNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ProfileNotification,
} from "@/lib/api";

type NotificationView = "all" | "replies";

function normalizeNotificationLink(link: string): string {
  if (/^https?:\/\//i.test(link)) return link;
  return link.startsWith("/") ? link : `/${link}`;
}

function notificationDestination(n: ProfileNotification): string | null {
  if (!n.link) return null;
  const href = normalizeNotificationLink(n.link);
  if (
    (n.type === "system" || n.title.toLowerCase().includes("welcome")) &&
    (href === "/profile" || href === "/profile/")
  ) {
    return "/phones";
  }
  return href;
}

function isExternalLink(link: string): boolean {
  return /^https?:\/\//i.test(link);
}

type NotificationMeta = {
  icon: LucideIcon;
  label: string;
  iconClass: string;
  chipClass: string;
};

function notificationMeta(type: string): NotificationMeta {
  switch (type) {
    case "reply":
    case "comment_reply":
      return {
        icon: MessageCircle,
        label: "Reply",
        iconClass: "bg-[var(--electric-cyan)]/15 text-[var(--electric-cyan)]",
        chipClass: "border-[var(--electric-cyan)]/25 bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]",
      };
    case "price_alert":
    case "alert":
      return {
        icon: Tag,
        label: "Alert",
        iconClass: "bg-[var(--premium-gold)]/15 text-[var(--premium-gold)]",
        chipClass: "border-[var(--premium-gold)]/25 bg-[var(--premium-gold)]/10 text-[var(--premium-gold)]",
      };
    case "system":
      return {
        icon: Sparkles,
        label: "Welcome",
        iconClass: "bg-[var(--aurora-purple)]/15 text-[var(--aurora-purple)]",
        chipClass: "border-[var(--aurora-purple)]/25 bg-[var(--aurora-purple)]/10 text-[var(--aurora-purple)]",
      };
    default:
      return {
        icon: Bell,
        label: "Update",
        iconClass: "bg-[var(--arena-blue)]/15 text-[var(--arena-blue)]",
        chipClass: "border-[var(--arena-blue)]/25 bg-[var(--arena-blue)]/10 text-[var(--arena-blue)]",
      };
  }
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

type NotificationsViewProps = {
  onInboxChange?: () => void;
};

export function NotificationsView({ onInboxChange }: NotificationsViewProps = {}) {
  const router = useRouter();
  const [view, setView] = useState<NotificationView>("all");
  const [items, setItems] = useState<ProfileNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | "all" | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfileNotifications(
        view === "replies" ? { scope: "replies" } : undefined,
      );
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  function notifyInboxChange() {
    onInboxChange?.();
  }

  async function markRead(n: ProfileNotification) {
    if (n.read) return;
    setActionError(null);
    try {
      const updated = await markNotificationRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      notifyInboxChange();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to mark notification as read",
      );
    }
  }

  async function markAllRead() {
    setBusyId("all");
    setActionError(null);
    try {
      await markAllNotificationsRead(view === "replies" ? "replies" : "all");
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      notifyInboxChange();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to mark notifications as read",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteOne(id: number) {
    setBusyId(id);
    setActionError(null);
    try {
      await deleteNotification(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      notifyInboxChange();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete notification",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAll() {
    if (!items.length) return;
    if (!window.confirm("Delete all notifications? This cannot be undone.")) return;
    setBusyId("all");
    setActionError(null);
    try {
      await clearAllNotifications();
      setItems([]);
      notifyInboxChange();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to clear notifications",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function openNotification(n: ProfileNotification) {
    const href = notificationDestination(n);
    if (!href) return;
    setActionError(null);

    if (!n.read) {
      try {
        const updated = await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        notifyInboxChange();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Failed to mark notification as read",
        );
      }
    }

    if (isExternalLink(href)) {
      window.location.assign(href);
      return;
    }
    router.push(href);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-[22px]" />
        <Skeleton className="h-32 rounded-[22px]" />
        <Skeleton className="h-32 rounded-[22px]" />
      </div>
    );
  }

  if (error) {
    return (
      <SpectrumPanel className="p-8 text-center text-red-400">
        {error}
      </SpectrumPanel>
    );
  }

  const unread = items.filter((x) => !x.read).length;

  return (
    <>
      <header className="relative mb-8 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[var(--arena-blue)]/20 via-[var(--surface-card)]/80 to-[var(--aurora-purple)]/15 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--electric-cyan)]/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
              Inbox
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">
              Notifications
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
              Stay updated when someone replies or when alerts trigger.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {items.length} total
            </span>
            {unread > 0 && (
              <span className="rounded-full border border-[var(--electric-cyan)]/30 bg-[var(--electric-cyan)]/10 px-3 py-1 text-xs font-bold text-[var(--electric-cyan)]">
                {unread} unread
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { id: "all" as const, label: "All" },
            { id: "replies" as const, label: "Replies & alerts" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setView(option.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              view === option.id
                ? "bg-[var(--electric-cyan)]/15 text-[var(--electric-cyan)] ring-1 ring-[var(--electric-cyan)]/30"
                : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {actionError}
        </p>
      )}

      {items.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {unread > 0 && (
            <button
              type="button"
              disabled={busyId === "all"}
              onClick={() => void markAllRead()}
              className="arena-btn-ghost inline-flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            type="button"
            disabled={busyId === "all"}
            onClick={() => void deleteAll()}
            className="arena-btn-ghost inline-flex items-center gap-1.5 text-xs text-[var(--rose-alert)] hover:text-[var(--rose-alert)] disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete all
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <SpectrumPanel className="flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--electric-cyan)]/20 to-[var(--aurora-purple)]/20">
            <Bell size={28} className="text-[var(--electric-cyan)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            All caught up
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            {view === "replies"
              ? "No reply or alert notifications yet."
              : "No notifications yet. Replies, price alerts, and updates will show up here."}
          </p>
        </SpectrumPanel>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const meta = notificationMeta(n.type);
            const Icon = meta.icon;
            return (
              <li key={n.id}>
                <SpectrumPanel
                  className={`group relative overflow-hidden p-4 transition duration-200 sm:p-5 ${
                    !n.read
                      ? "border-[var(--electric-cyan)]/25 shadow-lg shadow-[var(--electric-cyan)]/5"
                      : "opacity-90"
                  }`}
                >
                  {!n.read && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--electric-cyan)] to-[var(--aurora-purple)]" />
                  )}
                  <div className="flex gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chipClass}`}
                        >
                          {meta.label}
                        </span>
                        {!n.read && (
                          <span className="rounded-full bg-[var(--electric-cyan)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--dark-space)]">
                            New
                          </span>
                        )}
                        <time
                          className="text-xs text-[var(--text-secondary)]"
                          dateTime={n.createdAt}
                          title={new Date(n.createdAt).toLocaleString()}
                        >
                          {formatWhen(n.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 font-semibold text-[var(--text-primary)]">
                        {n.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {n.body}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {notificationDestination(n) && (
                          <button
                            type="button"
                            onClick={() => void openNotification(n)}
                            className="arena-btn-ghost inline-flex items-center gap-1 text-xs"
                          >
                            <ExternalLink size={12} />
                            View
                          </button>
                        )}
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => void markRead(n)}
                            className="arena-btn-ghost inline-flex items-center gap-1 text-xs text-[var(--electric-cyan)]"
                          >
                            <Check size={12} />
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === n.id}
                          onClick={() => void deleteOne(n.id)}
                          className="arena-btn-ghost inline-flex items-center gap-1 text-xs text-[var(--rose-alert)] opacity-70 transition hover:opacity-100 disabled:opacity-40"
                          aria-label={`Delete ${n.title}`}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </SpectrumPanel>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
