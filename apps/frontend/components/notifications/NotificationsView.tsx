"use client";

import { Link } from "@/i18n/navigation";
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
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import {
  clearAllNotifications,
  deleteNotification,
  getProfileNotifications,
  getPublicNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import {
  dismissPublicNotification,
  markAllPublicNotificationsRead,
  markPublicNotificationRead,
  mergeInboxNotifications,
  publicNotificationsToInbox,
  type InboxNotification,
} from "@/lib/notification-inbox";
import { formatDateTime, formatRelativeDate } from "@/lib/format-datetime";
import { useSiteAuth } from "@/lib/site-auth";

type NotificationView = "all" | "replies";

function normalizeNotificationLink(link: string): string {
  if (/^https?:\/\//i.test(link)) return link;
  return link.startsWith("/") ? link : `/${link}`;
}

function notificationDestination(n: InboxNotification): string | null {
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

function publicIdFromInbox(item: InboxNotification): string | null {
  if (item.source !== "public") return null;
  return item.id.replace(/^public:/, "");
}

function userIdFromInbox(item: InboxNotification): number | null {
  if (item.source !== "user" || item.userId == null) return null;
  return item.userId;
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
        chipClass:
          "border-[var(--electric-cyan)]/25 bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]",
      };
    case "price_alert":
    case "alert":
      return {
        icon: Tag,
        label: "Alert",
        iconClass: "bg-[var(--premium-gold)]/15 text-[var(--premium-gold)]",
        chipClass:
          "border-[var(--premium-gold)]/25 bg-[var(--premium-gold)]/10 text-[var(--premium-gold)]",
      };
    case "news":
    case "featured":
      return {
        icon: Bell,
        label: "News",
        iconClass: "bg-[var(--orange)]/15 text-[var(--orange)]",
        chipClass: "border-[var(--orange)]/25 bg-[var(--orange)]/10 text-[var(--orange)]",
      };
    case "system":
      return {
        icon: Sparkles,
        label: "Welcome",
        iconClass: "bg-[var(--aurora-purple)]/15 text-[var(--aurora-purple)]",
        chipClass:
          "border-[var(--aurora-purple)]/25 bg-[var(--aurora-purple)]/10 text-[var(--aurora-purple)]",
      };
    default:
      return {
        icon: Bell,
        label: "Update",
        iconClass: "bg-[var(--arena-blue)]/15 text-[var(--arena-blue)]",
        chipClass:
          "border-[var(--arena-blue)]/25 bg-[var(--arena-blue)]/10 text-[var(--arena-blue)]",
      };
  }
}

type NotificationsViewProps = {
  onInboxChange?: () => void;
};

export function NotificationsView({ onInboxChange }: NotificationsViewProps = {}) {
  const router = useRouter();
  const { user } = useSiteAuth();
  const [view, setView] = useState<NotificationView>("all");
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | "all" | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const publicRaw = await getPublicNotifications();
      const publicItems = publicNotificationsToInbox(publicRaw);

      if (user) {
        const userRaw = await getProfileNotifications(
          view === "replies" ? { scope: "replies" } : undefined,
        );
        const userItems: InboxNotification[] = userRaw.map((n) => ({
          id: `user:${n.id}`,
          source: "user",
          userId: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          read: n.read,
          link: n.link,
          createdAt: n.createdAt,
        }));

        const merged =
          view === "replies"
            ? userItems
            : mergeInboxNotifications(publicItems, userItems);
        setItems(merged);
      } else {
        setItems(view === "replies" ? [] : publicItems);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user, view]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  function notifyInboxChange() {
    onInboxChange?.();
  }

  function updateItem(id: string, patch: Partial<InboxNotification>) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function markRead(n: InboxNotification) {
    if (n.read) return;
    setActionError(null);

    if (n.source === "public") {
      const publicId = publicIdFromInbox(n);
      if (!publicId) return;
      markPublicNotificationRead(publicId);
      updateItem(n.id, { read: true });
      notifyInboxChange();
      return;
    }

    const userId = userIdFromInbox(n);
    if (!userId) return;

    try {
      const updated = await markNotificationRead(userId);
      updateItem(n.id, { read: updated.read });
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
      const publicIds = items
        .filter((item) => item.source === "public")
        .map((item) => publicIdFromInbox(item))
        .filter((id): id is string => Boolean(id));
      markAllPublicNotificationsRead(publicIds);

      if (user) {
        await markAllNotificationsRead(view === "replies" ? "replies" : "all");
      }

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

  async function deleteOne(item: InboxNotification) {
    setBusyId(item.id);
    setActionError(null);
    try {
      if (item.source === "public") {
        const publicId = publicIdFromInbox(item);
        if (publicId) dismissPublicNotification(publicId);
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        notifyInboxChange();
        return;
      }

      const userId = userIdFromInbox(item);
      if (!userId) return;
      await deleteNotification(userId);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
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
      const publicIds = items
        .filter((item) => item.source === "public")
        .map((item) => publicIdFromInbox(item))
        .filter((id): id is string => Boolean(id));
      for (const id of publicIds) dismissPublicNotification(id);

      if (user) {
        await clearAllNotifications();
      }

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

  async function openNotification(n: InboxNotification) {
    const href = notificationDestination(n);
    if (!href) return;
    setActionError(null);
    await markRead(n);

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
      <SpectrumPanel className="p-8 text-center text-red-400">{error}</SpectrumPanel>
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
              {user
                ? "Site updates, replies, and personal alerts in one place."
                : "Site updates and news for everyone. Sign in for reply and price alerts."}
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

      {!user && (
        <SpectrumPanel className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Sign in to get reply, compare, and price-alert notifications.
          </p>
          <Link href="/login?next=%2Fnotifications" className="arena-btn-primary text-xs">
            Sign in
          </Link>
        </SpectrumPanel>
      )}

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
            {!user && view === "replies"
              ? "Reply and price alerts are available after you sign in."
              : view === "replies"
                ? "No reply or alert notifications yet."
                : "No notifications yet. Site updates and news will appear here."}
          </p>
        </SpectrumPanel>
      ) : (
        <SwipePagedList
          items={items}
          getKey={(n) => n.id}
          as="ul"
          wrapperClassName="space-y-3"
          listClassName="space-y-3"
          renderItem={(n) => {
            const meta = notificationMeta(n.type);
            const Icon = meta.icon;
            return (
              <li>
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
                        {n.source === "public" && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                            Everyone
                          </span>
                        )}
                        {!n.read && (
                          <span className="rounded-full bg-[var(--electric-cyan)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--dark-space)]">
                            New
                          </span>
                        )}
                        <time
                          className="text-xs text-[var(--text-secondary)]"
                          dateTime={n.createdAt}
                          title={formatDateTime(n.createdAt)}
                        >
                          {formatRelativeDate(n.createdAt)}
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
                          onClick={() => void deleteOne(n)}
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
          }}
        />
      )}
    </>
  );
}
