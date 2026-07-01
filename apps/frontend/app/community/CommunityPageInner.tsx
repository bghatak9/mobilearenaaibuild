"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { CommunityPollsSection } from "@/components/community/CommunityPollsSection";
import { CommunityReviewsSection } from "@/components/community/CommunityReviewsSection";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import type { CommunityPoll, CommunityReviewItem } from "@/lib/community-types";
import { getCommunityPolls, getCommunityReviews } from "@/lib/api";

const TABS = [
  { id: "polls", label: "Polls" },
  { id: "reviews", label: "Reviews" },
  { id: "discussions", label: "Discussions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CommunityPageInner() {
  const [tab, setTab] = useState<TabId>("polls");
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [reviews, setReviews] = useState<CommunityReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pollData, reviewData] = await Promise.all([
        getCommunityPolls(),
        getCommunityReviews(),
      ]);
      setPolls(pollData as CommunityPoll[]);
      setReviews(reviewData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handlePollUpdate(slug: string, updated: CommunityPoll) {
    setPolls((list) => list.map((p) => (p.slug === slug ? updated : p)));
  }

  return (
    <>
      <Breadcrumbs
        className="mb-6"
        items={[{ label: "Home", href: "/" }, { label: "Community" }]}
      />

      <header className="mb-8">
        <h1 className="arena-page-title font-extrabold text-[var(--text-primary)]">
          MobileArena Community
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Vote on device, weekly, and comparison polls. Rate phones across eight categories,
          upload sample media, and climb the top reviewer rankings.
        </p>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === id
                ? "bg-[var(--arena-blue)]/30 text-[var(--electric-cyan)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading community…</p>
      ) : tab === "polls" ? (
        <CommunityPollsSection polls={polls} onPollUpdate={handlePollUpdate} />
      ) : tab === "reviews" ? (
        <CommunityReviewsSection reviews={reviews} onRefresh={() => void load()} />
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-[var(--text-secondary)]">
            Join device discussions and buying threads in Arena Discussions.
          </p>
          <Link
            href="/discussions"
            className="mt-4 inline-block text-sm font-semibold text-[var(--electric-cyan)] hover:underline"
          >
            Open Discussions →
          </Link>
        </div>
      )}
    </>
  );
}
