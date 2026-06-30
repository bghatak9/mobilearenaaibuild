"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useProfile } from "@/components/profile/ProfileProvider";
import { resolveAvatarUrl } from "@/lib/profile-avatars";
import { userDisplayId } from "@/lib/user-display-id";

export function ProfileDashboardCard({ actions }: { actions?: ReactNode }) {
  const { profile } = useProfile();
  if (!profile) return null;

  const displayName =
    profile.name?.trim() || userDisplayId(profile.email);
  const avatarUrl = resolveAvatarUrl(profile.avatar, profile.email);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="bg-gradient-to-r from-zinc-900 to-red-900 px-6 py-8 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            src={avatarUrl}
            alt=""
            className="h-20 w-20 rounded-full border-4 border-white/20 bg-white object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold">{displayName}</h2>
            <p className="mt-1 text-sm text-red-100">
              ⭐ {profile.headline} ({profile.reputationPoints.toLocaleString()}{" "}
              Points)
            </p>
            <p className="mt-1 text-xs text-zinc-300">
              @{userDisplayId(profile.email)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat emoji="❤️" label="Favorites" value={profile.stats.favoriteDevices} />
        <Stat emoji="🔖" label="Bookmarks" value={profile.stats.bookmarks} />
        <Stat emoji="💬" label="Comments" value={profile.stats.comments} />
        <Stat emoji="📝" label="Reviews" value={profile.stats.ratings} />
      </div>

      {actions && (
        <div className="flex flex-wrap gap-3 border-t border-gray-100 px-6 py-4 dark:border-zinc-800">
          {actions}
        </div>
      )}
    </div>
  );
}

function Stat({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950">
      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {emoji} {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export function ProfileActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
    >
      {children}
    </Link>
  );
}

export function ProfileActionSecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
