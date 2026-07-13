"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  BarChart3,
  GitCompareArrows,
  Loader2,
  Smartphone,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CommunityPoll, PollType } from "@/lib/community-types";
import { POLL_TYPE_META } from "@/lib/community-types";
import { voteOnPoll } from "@/lib/api";
import { cn } from "@/design-system/utils/cn";
import { useSiteAuth } from "@/lib/site-auth";

const POLL_TYPE_ICONS: Record<PollType, LucideIcon> = {
  DEVICE: Smartphone,
  WEEKLY: BarChart3,
  COMPARISON: GitCompareArrows,
};

function PollCard({
  poll,
  onVoted,
}: {
  poll: CommunityPoll;
  onVoted: (updated: CommunityPoll) => void;
}) {
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, ready: authReady } = useSiteAuth();
  const loggedIn = authReady && Boolean(user);
  const leadingPct = Math.max(...poll.choices.map((c) => c.pct), 0);

  async function vote(choiceId: string) {
    if (!loggedIn) {
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
    <article
      className="arena-community-poll"
      data-poll-type={poll.pollType.toLowerCase()}
    >
      <header className="arena-community-poll__header">
        <h3 className="arena-community-poll__question">{poll.question}</h3>
        <p className="arena-community-poll__meta">
          <Users size={13} aria-hidden />
          <span>
            {poll.totalVotes.toLocaleString("en-US")}{" "}
            {poll.totalVotes === 1 ? "vote" : "votes"}
          </span>
        </p>
      </header>

      <div className="arena-community-poll__choices" role="list">
        {poll.choices.map((choice) => {
          const isLeading = poll.totalVotes > 0 && choice.pct === leadingPct;
          const isVoting = voting === choice.id;

          return (
            <button
              key={choice.id}
              type="button"
              disabled={Boolean(voting)}
              onClick={() => void vote(choice.id)}
              className={cn(
                "arena-community-poll__choice",
                isLeading && poll.totalVotes > 0 && "arena-community-poll__choice--leading",
                isVoting && "arena-community-poll__choice--voting",
              )}
              role="listitem"
            >
              <span className="arena-community-poll__choice-top">
                <span className="arena-community-poll__radio" aria-hidden />
                <span className="arena-community-poll__label">{choice.label}</span>
                <span className="arena-community-poll__pct">{choice.pct}%</span>
              </span>
              <span className="arena-community-poll__bar" aria-hidden>
                <span
                  className="arena-community-poll__bar-fill"
                  style={{ width: `${Math.max(choice.pct, poll.totalVotes > 0 ? 2 : 0)}%` }}
                />
              </span>
              {isVoting ? (
                <Loader2
                  size={14}
                  className="arena-community-poll__spinner animate-spin"
                  aria-label="Submitting vote"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {poll.totalVotes === 0 ? (
        <p className="arena-community-poll__empty">Be the first to cast your vote.</p>
      ) : null}

      {error ? (
        <p className="arena-community-poll__error">
          {error}{" "}
          {!loggedIn ? (
            <Link href="/login?next=/community" className="underline">
              Sign in
            </Link>
          ) : null}
        </p>
      ) : null}
    </article>
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

  if (!polls.length) {
    return (
      <div className="arena-community-empty">
        <p>No polls are live right now. Check back soon for new community votes.</p>
      </div>
    );
  }

  return (
    <div className="arena-community-polls">
      {types.map((type) => {
        const group = polls.filter((p) => p.pollType === type);
        if (!group.length) return null;

        const meta = POLL_TYPE_META[type];
        const Icon = POLL_TYPE_ICONS[type];

        return (
          <section
            key={type}
            className="arena-community-poll-group"
            data-accent={meta.accent}
          >
            <header className="arena-community-poll-group__head">
              <div className="arena-community-poll-group__icon" aria-hidden>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="arena-community-poll-group__title">{meta.label}</h2>
                <p className="arena-community-poll-group__desc">{meta.description}</p>
              </div>
              <span className="arena-community-poll-group__count">
                {group.length} live
              </span>
            </header>

            <div className="arena-community-poll-grid">
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
