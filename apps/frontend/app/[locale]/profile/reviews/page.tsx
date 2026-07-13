"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

import { formatDate } from "@/lib/format-datetime";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { getMyRatings, type ProfileRating } from "@/lib/api";
import { BrandName } from "@/components/brands/BrandName";

export default function ReviewsPage() {
  const [ratings, setRatings] = useState<ProfileRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyRatings()
      .then(setRatings)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;

  return (
    <>
      <ProfilePageHeader
        title="My Reviews"
        description="Device ratings and scores you've submitted."
      />
      <ProfilePanel>
        {ratings.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            You haven&apos;t rated any phones yet.
          </p>
        ) : (
          <SwipePagedList
            items={ratings}
            getKey={(r) => r.id}
            as="ul"
            wrapperClassName="divide-y divide-gray-100 dark:divide-zinc-800"
            renderItem={(r) => (
              <li className="flex items-center justify-between py-4">
                <div>
                  <Link
                    href={`/phones/${r.device.slug}`}
                    className="font-medium text-red-600 hover:underline"
                  >
                    {r.device.name}
                  </Link>
                  {r.device.brand && (
                    <p className="text-xs text-gray-500">
                      <BrandName name={r.device.brand.name} />
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <span className="text-2xl font-bold text-amber-500">
                  {r.score}/10
                </span>
              </li>
            )}
          />
        )}
      </ProfilePanel>
    </>
  );
}
