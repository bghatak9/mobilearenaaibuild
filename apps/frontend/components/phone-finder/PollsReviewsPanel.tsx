"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Star, Vote } from "lucide-react";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import {
  getActivePoll,
  getToken,
  voteOnPoll,
  type ActivePoll,
  type Device,
} from "@/lib/api";

export function PollsReviewsPanel({
  reviewedDevices,
}: {
  reviewedDevices: Device[];
}) {
  const [poll, setPoll] = useState<ActivePoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loggedIn = Boolean(getToken());

  useEffect(() => {
    getActivePoll()
      .then(setPoll)
      .catch(() => setPoll(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(choiceId: string) {
    if (!loggedIn) {
      setError("Sign in to vote.");
      return;
    }
    if (!poll) return;
    setError(null);
    setVoting(choiceId);
    try {
      setPoll(await voteOnPoll({ pollSlug: poll.slug, choiceId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setVoting(null);
    }
  }

  return (
    <SpectrumPanel className="mb-6 p-5">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          Polls & reviews
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Vote size={16} className="text-[var(--electric-cyan)]" />
            Community poll
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-white/5" />
              ))}
            </div>
          ) : poll ? (
            <>
              <p className="mb-3 text-sm text-[var(--text-secondary)]">{poll.question}</p>
              <div className="space-y-3">
                {poll.choices.map((row) => (
                  <div key={row.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[var(--text-primary)]">{row.label}</span>
                      <span className="text-[var(--text-secondary)]">{row.pct}%</span>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(voting)}
                      onClick={() => void handleVote(row.id)}
                      className="group w-full text-left"
                    >
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--arena-blue)] to-[var(--electric-cyan)] transition-all"
                          style={{ width: `${Math.max(row.pct, 4)}%` }}
                        />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                {poll.totalVotes.toLocaleString()} votes
              </p>
              {error && (
                <p className="mt-2 text-xs text-[var(--rose-alert)]">
                  {error}{" "}
                  {!loggedIn && (
                    <Link href="/login?next=/phone-finder" className="underline">
                      Sign in
                    </Link>
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">No active poll right now.</p>
          )}
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Star size={16} className="text-[var(--premium-gold)]" />
            Top reviewed in your results
          </p>
          <ul className="space-y-2">
            {reviewedDevices.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
              >
                <Link
                  href={`/phones/${d.slug}`}
                  className="font-medium text-[var(--electric-cyan)] hover:underline"
                >
                  {d.name}
                </Link>
                <div className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-secondary)]">
                  {d.rating != null && (
                    <span className="text-[var(--premium-gold)]">{d.rating.toFixed(1)}★</span>
                  )}
                  <Link
                    href={`/phones/${d.slug}#reviews`}
                    className="flex items-center gap-1 hover:text-[var(--electric-cyan)]"
                  >
                    <MessageSquare size={12} />
                    Reviews
                  </Link>
                </div>
              </li>
            ))}
            {!reviewedDevices.length && (
              <li className="text-sm text-[var(--text-secondary)]">
                Adjust filters to see rated phones, or browse{" "}
                <Link href="/reviews" className="text-[var(--electric-cyan)] hover:underline">
                  all reviews
                </Link>
                .
              </li>
            )}
          </ul>
        </div>
      </div>
    </SpectrumPanel>
  );
}
