"use client";

import { useEffect, useState } from "react";

import { formatDateTime } from "@/lib/format-datetime";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { getPollHistory, type ProfilePollVote } from "@/lib/api";

export default function PollsPage() {
  const [votes, setVotes] = useState<ProfilePollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPollHistory()
      .then(setVotes)
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
        title="Poll History"
        description="Polls and community votes you've participated in."
      />
      <ProfilePanel>
        {votes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No poll votes yet. Participate in community polls when they appear on
            the site.
          </p>
        ) : (
          <SwipePagedList
            items={votes}
            getKey={(v) => v.id}
            as="ul"
            wrapperClassName="divide-y divide-gray-100 dark:divide-zinc-800"
            renderItem={(v) => (
              <li className="py-4">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {v.pollTitle}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Your choice: <strong>{v.choice}</strong>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateTime(v.createdAt)}
                </p>
              </li>
            )}
          />
        )}
      </ProfilePanel>
    </>
  );
}
