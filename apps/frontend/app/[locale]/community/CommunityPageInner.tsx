"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  BarChart3,
  MessageSquare,
  Star,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CommunityPollsSection } from "@/components/community/CommunityPollsSection";
import { CommunityReviewsSection } from "@/components/community/CommunityReviewsSection";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { cn } from "@/design-system/utils/cn";
import type { CommunityPoll, CommunityReviewItem } from "@/lib/community-types";
import { getCommunityPolls, getCommunityReviews } from "@/lib/api";

const TABS = [
  { id: "polls", label: "Polls", icon: Vote },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="arena-community-stat">
      <Icon size={16} className="arena-community-stat__icon" aria-hidden />
      <div>
        <p className="arena-community-stat__value">{value}</p>
        <p className="arena-community-stat__label">{label}</p>
      </div>
    </div>
  );
}

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

  const stats = useMemo(() => {
    const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
    return {
      pollCount: polls.length,
      totalVotes: totalVotes.toLocaleString("en-US"),
      reviewCount: reviews.length.toLocaleString("en-US"),
    };
  }, [polls, reviews]);

  function handlePollUpdate(slug: string, updated: CommunityPoll) {
    setPolls((list) => list.map((p) => (p.slug === slug ? updated : p)));
  }

  return (
    <>
      <Breadcrumbs
        className="mb-6"
        items={[{ label: "Home", href: "/" }, { label: "Community" }]}
      />

      <header className="arena-community-hero">
        <div className="arena-community-hero__copy">
          <p className="arena-community-hero__eyebrow">Arena Community</p>
          <h1 className="arena-community-hero__title">MobileArena Community</h1>
          <p className="arena-community-hero__desc">
            Vote on device, weekly, and comparison polls. Rate phones across eight
            categories, upload sample media, and climb the top reviewer rankings.
          </p>
        </div>

        <div className="arena-community-hero__stats">
          <StatChip icon={BarChart3} label="Live polls" value={String(stats.pollCount)} />
          <StatChip icon={Users} label="Total votes" value={stats.totalVotes} />
          <StatChip icon={Trophy} label="Reviews" value={stats.reviewCount} />
        </div>
      </header>

      <div className="arena-community-tabs" role="tablist" aria-label="Community sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "arena-community-tabs__btn",
              tab === id && "arena-community-tabs__btn--active",
            )}
          >
            <Icon size={15} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <SpectrumPanel className="arena-community-loading p-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Loading community…</p>
        </SpectrumPanel>
      ) : tab === "polls" ? (
        <CommunityPollsSection polls={polls} onPollUpdate={handlePollUpdate} />
      ) : tab === "reviews" ? (
        <CommunityReviewsSection reviews={reviews} onRefresh={() => void load()} />
      ) : (
        <SpectrumPanel className="arena-community-discussions p-8 sm:p-10">
          <div className="mx-auto max-w-lg text-center">
            <div className="arena-community-discussions__icon" aria-hidden>
              <MessageSquare size={24} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Arena Discussions
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Join device threads, buying advice, and deep-dive conversations with
              other Arena members.
            </p>
            <Link href="/discussions" className="arena-community-discussions__cta">
              Open Discussions
            </Link>
          </div>
        </SpectrumPanel>
      )}
    </>
  );
}
