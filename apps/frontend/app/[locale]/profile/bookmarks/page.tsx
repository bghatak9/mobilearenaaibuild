"use client";

import { formatDate } from "@/lib/format-datetime";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { bookmarkHref } from "@/lib/profile-nav";
import {
  getMyBookmarks,
  removeBookmark,
  type UserBookmark,
} from "@/lib/api";

export default function BookmarksPage() {
  const [items, setItems] = useState<UserBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyBookmarks()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(item: UserBookmark) {
    await removeBookmark(item.entityType, item.entityId);
    setItems((prev) => prev.filter((x) => x.id !== item.id));
  }

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;

  return (
    <>
      <ProfilePageHeader
        title="Bookmarks"
        description="Saved articles, reviews, and devices."
      />
      <ProfilePanel>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No bookmarks yet. Save devices from{" "}
            <Link href="/phone-finder" className="text-red-600 hover:underline">
              Phone Finder
            </Link>
            .
          </p>
        ) : (
          <SwipePagedList
            items={items}
            getKey={(item) => item.id}
            as="ul"
            wrapperClassName="divide-y divide-gray-100 dark:divide-zinc-800"
            listClassName="divide-y divide-gray-100 dark:divide-zinc-800"
            renderItem={(item) => (
              <li className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-xs uppercase text-gray-400">
                    {item.entityType}
                  </p>
                  <Link
                    href={bookmarkHref(item.entityType, item.slug)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    {item.title ?? `Item #${item.entityId}`}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(item)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            )}
          />
        )}
      </ProfilePanel>
    </>
  );
}
