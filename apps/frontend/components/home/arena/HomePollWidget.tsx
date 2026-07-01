"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import {
  getActivePoll,
  voteOnPoll,
  type ActivePoll,
} from "@/lib/api";
import { getToken } from "@/lib/api";

export function HomePollWidget({ reviewsLink }: { reviewsLink?: string }) {
  const [poll, setPoll] = useState<ActivePoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
    getActivePoll()
      .then(setPoll)
      .catch(() => setPoll(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(choiceId: string) {
    if (!loggedIn) {
      setError("Sign in to vote on community polls.");
      return;
    }
    setError(null);
    setVoting(choiceId);
    try {
      const updated = await voteOnPoll({ pollSlug: poll!.slug, choiceId });
      setPoll(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setVoting(null);
    }
  }

  if (loading) {
    return (
      <SpectrumPanel variant="purple" className="p-6">
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </SpectrumPanel>
    );
  }

  if (!poll) {
    return (
      <SpectrumPanel variant="purple" className="p-6 text-sm text-[var(--text-secondary)]">
        Community polls appear here soon.
      </SpectrumPanel>
    );
  }

  return (
    <SpectrumPanel variant="purple" className="p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--aurora-purple)]">
        Community poll
      </p>
      <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
        {poll.question}
      </p>
      <div className="mt-5 space-y-4">
        {poll.choices.map((row) => (
          <div key={row.id}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-medium text-[var(--text-primary)]">{row.label}</span>
              <span className="font-semibold text-[var(--electric-cyan)]">{row.pct}%</span>
            </div>
            <button
              type="button"
              disabled={Boolean(voting)}
              onClick={() => void handleVote(row.id)}
              className="group w-full text-left"
            >
              <div className="arena-score-bar">
                <div
                  className="arena-score-fill transition-all duration-250 group-hover:opacity-90"
                  style={{ width: `${Math.max(row.pct, 4)}%` }}
                />
              </div>
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">
        {poll.totalVotes.toLocaleString()} votes
      </p>
      {error && (
        <p className="mt-3 text-xs text-[var(--rose-alert)]">
          {error}{" "}
          {!loggedIn && (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          )}
        </p>
      )}
      {reviewsLink && (
        <Link
          href={reviewsLink}
          className="mt-4 inline-block text-sm text-[var(--electric-cyan)] hover:underline"
        >
          Read latest reviews
        </Link>
      )}
    </SpectrumPanel>
  );
}
