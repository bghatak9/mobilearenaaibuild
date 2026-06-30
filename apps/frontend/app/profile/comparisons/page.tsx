"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import {
  deleteSavedComparison,
  getSavedComparisons,
  type SavedComparison,
} from "@/lib/api";

export default function ComparisonsPage() {
  const [items, setItems] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSavedComparisons()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(id: number) {
    await deleteSavedComparison(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;

  return (
    <>
      <ProfilePageHeader
        title="Saved Comparisons"
        description="Side-by-side matchups you've saved to your account."
      />
      <ProfilePanel>
        <p className="mb-4 text-sm text-gray-500">
          Add phones to compare from any device page, then save from the compare
          screen. Comparisons sync across devices when signed in.
        </p>
        <ul className="space-y-3">
          {items.length === 0 ? (
            <li className="py-8 text-center text-sm text-gray-500">
              No saved comparisons yet.{" "}
              <Link href="/phones" className="text-red-600 hover:underline">
                Browse phones
              </Link>
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={`/compare/${item.compareSlug}`}
                    className="font-semibold text-red-600 hover:underline"
                  >
                    {item.name ?? item.deviceSlugs.join(" vs ")}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {item.deviceSlugs.length} devices · Saved{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/compare/${item.compareSlug}`}
                    className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleRemove(item.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </ProfilePanel>
    </>
  );
}
