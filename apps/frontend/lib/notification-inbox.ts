export type PublicNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  createdAt: string;
};

export type InboxNotification = {
  id: string;
  source: "public" | "user";
  userId?: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

const READ_KEY = "ma-public-notifications-read";
const DISMISSED_KEY = "ma-public-notifications-dismissed";

function readIdSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export function getPublicNotificationReadIds(): Set<string> {
  return readIdSet(READ_KEY);
}

export function getPublicNotificationDismissedIds(): Set<string> {
  return readIdSet(DISMISSED_KEY);
}

export function markPublicNotificationRead(id: string) {
  const ids = getPublicNotificationReadIds();
  ids.add(id);
  writeIdSet(READ_KEY, ids);
}

export function markAllPublicNotificationsRead(publicIds: string[]) {
  const ids = getPublicNotificationReadIds();
  for (const id of publicIds) ids.add(id);
  writeIdSet(READ_KEY, ids);
}

export function dismissPublicNotification(id: string) {
  const dismissed = getPublicNotificationDismissedIds();
  dismissed.add(id);
  writeIdSet(DISMISSED_KEY, dismissed);
  markPublicNotificationRead(id);
}

export function clearDismissedPublicNotifications() {
  writeIdSet(DISMISSED_KEY, new Set());
}

export function publicNotificationsToInbox(
  items: PublicNotification[],
): InboxNotification[] {
  const readIds = getPublicNotificationReadIds();
  const dismissed = getPublicNotificationDismissedIds();

  return items
    .filter((item) => !dismissed.has(item.id))
    .map((item) => ({
      id: `public:${item.id}`,
      source: "public" as const,
      type: item.type,
      title: item.title,
      body: item.body,
      read: readIds.has(item.id),
      link: item.link,
      createdAt: item.createdAt,
    }));
}

export function mergeInboxNotifications(
  publicItems: InboxNotification[],
  userItems: InboxNotification[],
): InboxNotification[] {
  const seen = new Set<string>();
  const merged: InboxNotification[] = [];

  for (const item of [...userItems, ...publicItems]) {
    const key = `${item.title}::${item.link ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function countUnreadInbox(items: InboxNotification[]): number {
  return items.filter((item) => !item.read).length;
}
