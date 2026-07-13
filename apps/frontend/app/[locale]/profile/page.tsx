"use client";

import { Link } from "@/i18n/navigation";
import { MessageSquare, Star } from "lucide-react";

import {
  ProfileActionLink,
  ProfileActionSecondaryLink,
  ProfileDashboardCard,
} from "@/components/profile/ProfileDashboardCard";
import { useProfile } from "@/components/profile/ProfileProvider";
import {
  ProfileError,
  ProfileLoading,
  ProfilePanel,
} from "@/components/profile/ProfileShell";

export default function ProfileDashboardPage() {
  const { profile, loading, error } = useProfile();

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <ProfileDashboardCard
        actions={
          <>
            <ProfileActionLink href="/profile/edit">Edit Profile</ProfileActionLink>
            <ProfileActionSecondaryLink href="/profile/security">
              Security Settings
            </ProfileActionSecondaryLink>
          </>
        }
      />

      <ProfilePanel>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
          Recent activity
        </h3>
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-zinc-800">
          {profile.activity.length === 0 ? (
            <li className="py-6 text-center text-sm text-gray-500">
              No recent activity.{" "}
              <Link href="/phones" className="text-red-600 hover:underline">
                Browse phones
              </Link>
            </li>
          ) : (
            profile.activity.slice(0, 8).map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex gap-3 py-3">
                <span className="mt-0.5 text-red-600">
                  {item.type === "comment" ? (
                    <MessageSquare size={16} />
                  ) : (
                    <Star size={16} />
                  )}
                </span>
                <div className="min-w-0 text-sm">
                  {item.type === "comment" ? (
                    <>
                      Comment on{" "}
                      <Link
                        href={`/phones/${item.device.slug}`}
                        className="font-medium text-red-600 hover:underline"
                      >
                        {item.device.name}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-gray-500">{item.body}</p>
                    </>
                  ) : (
                    <>
                      Rated{" "}
                      <Link
                        href={`/phones/${item.device.slug}`}
                        className="font-medium text-red-600 hover:underline"
                      >
                        {item.device.name}
                      </Link>{" "}
                      {item.score}/10
                    </>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
        {profile.activity.length > 0 && (
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="/profile/comments" className="text-red-600 hover:underline">
              All comments
            </Link>
            <Link href="/profile/reviews" className="text-red-600 hover:underline">
              All reviews
            </Link>
          </div>
        )}
      </ProfilePanel>
    </div>
  );
}
