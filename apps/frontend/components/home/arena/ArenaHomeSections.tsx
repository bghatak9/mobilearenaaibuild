"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

import { DeviceBriefFeatureLink } from "@/components/device-brief/DeviceBriefFeatureLink";
import { TrendingArenaScroll } from "@/components/home/arena/TrendingArenaScroll";
import { EditorsChoiceScroll } from "@/components/home/arena/EditorsChoiceScroll";
import { HomeSwipeDeviceGrid } from "@/components/home/arena/HomeSwipeDeviceGrid";
import { CommunityStreamPanel } from "@/components/home/arena/CommunityStreamSwipe";
import { EditorsArenaSwipe } from "@/components/home/arena/EditorsArenaSwipe";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { getTrendingArenaDevices, getUpcomingDevices } from "@/features/phone-finder/device-utils";
import type { Device, NewsArticle, Review } from "@/lib/api";
import { useSiteLanguage } from "@/lib/site-language";

type SectionProps = {
  devices: Device[];
  news: NewsArticle[];
  reviews: Review[];
};

function SectionHeader({
  title,
  subtitle,
  href,
  viewAllLabel,
  accent = "default",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  viewAllLabel: string;
  accent?: "default" | "gold";
}) {
  return (
    <div
      className={`arena-section-header mb-6 flex flex-wrap items-end justify-between gap-3 ${ accent === "gold" ? "arena-section-header-gold" : "" }`}
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--electric-cyan)] transition hover:bg-[var(--electric-cyan)]/15"
        >
          {viewAllLabel} <ArrowRight size={14} className="arena-rtl-mirror" />
        </Link>
      )}
    </div>
  );
}

export function TrendingArenaSection({ devices }: { devices: Device[] }) {
  const { t } = useSiteLanguage();
  const trending = getTrendingArenaDevices(devices);

  return (
    <section aria-labelledby="trending-arena" className="arena-home-section">
      <SectionHeader
        title={t("home.trendingArena")}
        subtitle={t("home.trendingSubtitle")}
        href="/phones?trending=1"
        viewAllLabel={t("home.viewAll")}
      />
      <TrendingArenaScroll devices={trending} />
    </section>
  );
}

export function EditorsChoiceSection({ devices }: { devices: Device[] }) {
  const { t } = useSiteLanguage();
  return (
    <section aria-labelledby="editors-choice" className="arena-home-section">
      <SectionHeader
        title={t("home.editorsChoices")}
        subtitle={t("home.editorsSubtitle")}
        href="/reviews"
        viewAllLabel={t("home.viewAll")}
        accent="gold"
      />
      <EditorsChoiceScroll devices={devices} />
    </section>
  );
}

export function UpcomingDevicesSection({ devices }: { devices: Device[] }) {
  const { t } = useSiteLanguage();
  const upcoming = getUpcomingDevices(devices, devices.length);

  return (
    <section aria-labelledby="upcoming-devices" className="arena-home-section">
      <SectionHeader
        title={t("home.upcomingDevices")}
        subtitle={t("home.upcomingSubtitle")}
        href="/phones?upcoming=1"
        viewAllLabel={t("home.viewAll")}
      />
      <HomeSwipeDeviceGrid
        devices={upcoming}
        variant="upcoming"
        emptyMessage={t("home.upcomingSubtitle")}
      />
    </section>
  );
}

export function AiRecommendationsSection({ devices }: { devices: Device[] }) {
  const { t } = useSiteLanguage();
  const picks = devices.slice(0, 3);
  return (
    <section aria-labelledby="ai-recs" className="arena-home-section">
      <SectionHeader
        title={t("home.aiRecommendations")}
        subtitle={t("home.aiSubtitle")}
        viewAllLabel={t("home.viewAll")}
      />
      <SpectrumPanel variant="purple" className="grid gap-4 p-6 md:grid-cols-3">
        {picks.map((d) => (
          <DeviceBriefFeatureLink key={d.id} device={d} />
        ))}
        {picks.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] md:col-span-3">
            {t("home.aiSignInHint")}
          </p>
        )}
      </SpectrumPanel>
    </section>
  );
}

export function CommunityStreamSection() {
  const { t } = useSiteLanguage();
  return (
    <section aria-labelledby="community-stream" className="arena-home-section">
      <SectionHeader
        title={t("home.communityStream")}
        subtitle={t("home.communityStreamSubtitle")}
        href="/community"
        viewAllLabel={t("home.viewAll")}
      />
      <CommunityStreamPanel />
    </section>
  );
}

export function LaunchTimelineSection() {
  const { t } = useSiteLanguage();
  const launches = [
    { name: "Prism Horizon Max", date: "Jul 2026", status: "Rumored" },
    { name: "Echo Slate Fold", date: "Aug 2026", status: "Confirmed" },
    { name: "Volt Ember Lite", date: "Sep 2026", status: "Leaked" },
  ];
  return (
    <section aria-labelledby="launch-timeline" className="arena-home-section">
      <SectionHeader
        title={t("home.launchTimeline")}
        subtitle={t("home.launchTimelineSubtitle")}
        viewAllLabel={t("home.viewAll")}
      />
      <SpectrumPanel variant="elevated" className="p-6">
        <div className="relative ml-3 border-l-2 border-[var(--border-accent)] pl-8">
          {launches.map((l) => (
            <div key={l.name} className="relative mb-8 last:mb-0">
              <span className="absolute -left-[2.4rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--electric-cyan)] bg-[var(--surface-card)] ring-4 ring-[var(--electric-cyan)]/15">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--electric-cyan)]" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--electric-cyan)]">
                {l.date} · {l.status}
              </p>
              <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
                {l.name}
              </p>
            </div>
          ))}
        </div>
      </SpectrumPanel>
    </section>
  );
}

export function EditorsArenaSection({
  reviews,
  news,
}: Pick<SectionProps, "reviews" | "news">) {
  const { t } = useSiteLanguage();
  return (
    <section aria-labelledby="editors-arena" className="arena-home-section">
      <SectionHeader
        title={t("home.editorsArena")}
        subtitle={t("home.editorsArenaSubtitle")}
        viewAllLabel={t("home.viewAll")}
        accent="gold"
      />
      <EditorsArenaSwipe reviews={reviews} news={news} />
    </section>
  );
}

export function ReviewsPollsSection({ reviews }: { reviews: Review[] }) {
  const { t } = useSiteLanguage();
  return (
    <section aria-labelledby="reviews-polls" className="arena-home-section">
      <SectionHeader
        title={t("home.reviewsPolls")}
        href="/reviews"
        viewAllLabel={t("home.viewAll")}
      />
      <SpectrumPanel variant="purple" className="p-6">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {t("home.communityPoll")}
        </p>
        <div className="mt-4 space-y-3">
          {[
            { label: "Nimbus Arc Ultra", pct: 42 },
            { label: "Volt Stride Pro", pct: 35 },
            { label: "Prism Horizon", pct: 23 },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-[var(--text-primary)]">{row.label}</span>
                <span className="font-medium text-[var(--electric-cyan)]">{row.pct}%</span>
              </div>
              <div className="arena-score-bar">
                <div className="arena-score-fill" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        {reviews[0] && (
          <Link
            href={`/reviews/${reviews[0].slug}`}
            className="mt-4 inline-block text-sm font-semibold text-[var(--electric-cyan)] hover:underline"
          >
            {reviews[0].title}
          </Link>
        )}
      </SpectrumPanel>
    </section>
  );
}

export function ArenaPulseSection() {
  const stats = [
    { icon: Users, label: "Users Online", value: "12,421", tone: "cyan" as const },
    { icon: TrendingUp, label: "Comparisons Today", value: "18,900", tone: "blue" as const },
    { icon: Zap, label: "Top Trending", value: "Nimbus Arc", tone: "purple" as const },
    { icon: Sparkles, label: "Most Active", value: "Volt Fans", tone: "gold" as const },
  ];

  const toneClass = {
    cyan: "arena-stat-card-cyan",
    blue: "arena-stat-card-blue",
    purple: "arena-stat-card-purple",
    gold: "arena-stat-card-gold",
  };

  return (
    <section aria-label="Arena pulse" className="arena-home-section">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className={`arena-stat-card ${toneClass[tone]}`}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-glow)]">
                <Icon size={18} className="text-[var(--electric-cyan)]" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ArenaSiteFooter as ArenaFooterEcosystem } from "@/components/home/arena/ArenaSiteFooter";
