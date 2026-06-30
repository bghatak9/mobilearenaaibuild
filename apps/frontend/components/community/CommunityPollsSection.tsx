"use client";

import { useState } from "react";
import Link from "next/link";

import { GlassPanel } from "@/design-system/glass/GlassPanel";
import type { CommunityPoll, PollType } from "@/lib/community-types";
import { POLL_TYPE_LABELS } from "@/lib/community-types";
import { getToken, voteOnPoll } from "@/lib/api";

function PollCard({
  poll,
  onVoted,
}: {
  poll: CommunityPoll;
  onVoted: (updated: CommunityPoll) => void;
}) {
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function vote(choiceId: string) {
    if (!getToken()) {
      setError("Sign in to vote.");
      return;
    }
    setError(null);
    setVoting(choiceId);
    try {
      const updated = await voteOnPoll({ pollSlug: poll.slug, choiceId });
      onVoted({ ...poll, ...updated, pollType: poll.pollType });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setVoting(null);
    }
  }

  return (
    <GlassPanel className="p-5">
      <h3 className="font-bold text-[var(--text-primary)]">{poll.question}</h3>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        {poll.totalVotes.toLocaleString()} votes
      </p>
      <div className="mt-4 space-y-3">
        {poll.choices.map((choice) => (
          <div key={choice.id}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-[var(--text-primary)]">○ {choice.label}</span>
              <span className="text-[var(--text-secondary)]">{choice.pct}%</span>
            </div>
            <button
              type="button"
              disabled={Boolean(voting)}
              onClick={() => void vote(choice.id)}
              className="group w-full text-left"
            >
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--arena-blue)] to-[var(--electric-cyan)] transition-all"
                  style={{ width: `${Math.max(choice.pct, 4)}%` }}
                />
              </div>
            </button>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-3 text-xs text-[var(--rose-alert)]">
          {error}{" "}
          {!getToken() && (
            <Link href="/login?next=/community" className="underline">
              Sign in
            </Link>
          )}
        </p>
      )}
    </GlassPanel>
  );
}

export function CommunityPollsSection({
  polls,
  onPollUpdate,
}: {
  polls: CommunityPoll[];
  onPollUpdate: (slug: string, updated: CommunityPoll) => void;
}) {
  const types: PollType[] = ["DEVICE", "WEEKLY", "COMPARISON"];

  return (
    <div className="space-y-8">
      {types.map((type) => {
        const group = polls.filter((p) => p.pollType === type);
        if (!group.length) return null;
        return (
          <section key={type}>
            <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
              {POLL_TYPE_LABELS[type]}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.map((poll) => (
                <PollCard
                  key={poll.slug}
                  poll={poll}
                  onVoted={(updated) => onPollUpdate(poll.slug, updated)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
