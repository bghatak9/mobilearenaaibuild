"use client";

import { useProfile } from "@/components/profile/ProfileProvider";
import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";

export default function ReputationPage() {
  const { profile, loading, error } = useProfile();

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;
  if (!profile) return null;

  return (
    <>
      <ProfilePageHeader
        title="Reputation & Badges"
        description="Earn points from comments, ratings, and favorites. Unlock badges as you grow."
      />
      <ProfilePanel>
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-red-50 p-6 dark:from-amber-950/20 dark:to-red-950/20">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Total reputation
          </p>
          <p className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {profile.reputationPoints.toLocaleString()} pts
          </p>
          <p className="mt-2 text-sm text-gray-500">
            10 pts per comment · 5 pts per rating · 3 pts per favorite brand
          </p>
        </div>

        <h3 className="mt-8 font-bold text-zinc-900 dark:text-zinc-100">
          Badges ({profile.badges.earned.length}/{profile.badges.available.length})
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.badges.available.map((badge) => (
            <div
              key={badge.slug}
              className={`rounded-xl border p-4 ${
                badge.earned
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
                  : "border-gray-100 opacity-60 grayscale dark:border-zinc-800"
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <p className="mt-2 font-semibold">{badge.name}</p>
              <p className="mt-1 text-xs text-gray-500">{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <p className="mt-2 text-[10px] uppercase text-amber-700">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </ProfilePanel>
    </>
  );
}
