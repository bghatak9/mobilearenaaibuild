import Link from "next/link";
import { ArrowRight, Calendar, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

import { ArenaCard } from "@/design-system/cards/ArenaCard";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import {
  formatDeviceLaunchLabel,
  getUpcomingDevices,
} from "@/features/phone-finder/device-utils";
import type { Device, NewsArticle, Review } from "@/lib/api";

type SectionProps = {
  devices: Device[];
  news: NewsArticle[];
  reviews: Review[];
};

function SectionHeader({
  title,
  subtitle,
  href,
  accent = "default",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  accent?: "default" | "gold";
}) {
  return (
    <div
      className={`arena-section-header mb-6 flex flex-wrap items-end justify-between gap-3 ${
        accent === "gold" ? "arena-section-header-gold" : ""
      }`}
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
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export function TrendingArenaSection({ devices }: { devices: Device[] }) {
  const trending = devices.slice(0, 4);
  return (
    <section aria-labelledby="trending-arena" className="arena-home-section">
      <SectionHeader
        title="Trending Arena"
        subtitle="What the community is exploring right now"
        href="/phones"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {trending.length > 0 ? (
          trending.map((d, i) => (
            <ArenaCard
              key={d.id}
              href={`/phones/${d.slug}`}
              slug={d.slug}
              deviceId={d.id}
              title={d.name}
              subtitle={d.brand?.name}
              chip={d.chipset?.cpu?.split(" ").slice(0, 2).join(" ") ?? d.os ?? undefined}
              specPreview={
                d.display
                  ? `${d.display.size}" · ${d.display.refreshRate}Hz · ${d.battery?.capacity ?? "—"}mAh`
                  : undefined
              }
              price={d.price != null ? `$${d.price.toLocaleString()}` : undefined}
              image={d.images?.[0]?.url}
              badge={i === 0 ? "Trending #1" : "Trending"}
              communityScore={d.rating ? Math.round(d.rating * 10) : undefined}
            />
          ))
        ) : (
          <SpectrumPanel variant="accent" className="col-span-full p-10 text-center text-[var(--text-secondary)]">
            Trending devices appear here as the catalog grows.
          </SpectrumPanel>
        )}
      </div>
    </section>
  );
}

export function EditorsChoiceSection({ devices }: { devices: Device[] }) {
  const picks = devices.slice(0, 3);
  return (
    <section aria-labelledby="editors-choice" className="arena-home-section">
      <SectionHeader
        title="Editor's Choices"
        subtitle="Hand-picked by the MobileArena editorial team"
        href="/reviews"
        accent="gold"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {picks.length > 0 ? (
          picks.map((d) => (
            <ArenaCard
              key={d.id}
              href={`/phones/${d.slug}`}
              slug={d.slug}
              deviceId={d.id}
              title={d.name}
              subtitle={d.brand?.name}
              chip={d.os ?? undefined}
              price={d.price != null ? `$${d.price.toLocaleString()}` : undefined}
              image={d.images?.[0]?.url}
              badge="Editor Choice"
              communityScore={d.rating ? Math.round(d.rating * 10) : undefined}
            />
          ))
        ) : (
          <SpectrumPanel variant="gold" className="col-span-full p-10 text-center text-[var(--text-secondary)]">
            Editor picks appear as reviews are published.
          </SpectrumPanel>
        )}
      </div>
    </section>
  );
}

export function UpcomingDevicesSection({ devices }: { devices: Device[] }) {
  const upcoming = getUpcomingDevices(devices, 4);

  return (
    <section aria-labelledby="upcoming-devices" className="arena-home-section">
      <SectionHeader
        title="Upcoming Devices"
        subtitle="Bulk-uploaded launches from Admin → Bulk Upload"
        href="/phones?upcoming=1"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {upcoming.length > 0 ? (
          upcoming.map((device) => (
            <ArenaCard
              key={device.id}
              href={`/phones/${device.slug}`}
              slug={device.slug}
              deviceId={device.id}
              title={device.name}
              subtitle={device.brand?.name}
              chip={formatDeviceLaunchLabel(device)}
              specPreview={
                device.display
                  ? `${device.display.size}" · ${device.display.refreshRate ?? "—"}Hz`
                  : device.os ?? undefined
              }
              price={
                device.price != null
                  ? `$${device.price.toLocaleString()}`
                  : "TBA"
              }
              image={device.images?.[0]?.url}
              badge="Upcoming"
              communityScore={
                device.rating ? Math.round(device.rating * 10) : undefined
              }
            />
          ))
        ) : (
          <SpectrumPanel
            variant="accent"
            className="col-span-full flex flex-col items-center gap-3 p-10 text-center text-[var(--text-secondary)]"
          >
            <Calendar size={28} className="text-[var(--electric-cyan)]" />
            <p>Upload upcoming devices via Admin → Bulk Upload to show launches here.</p>
          </SpectrumPanel>
        )}
      </div>
    </section>
  );
}

export function AiRecommendationsSection({ devices }: { devices: Device[] }) {
  const picks = devices.slice(0, 3);
  return (
    <section aria-labelledby="ai-recs" className="arena-home-section">
      <SectionHeader
        title="AI Device Recommendations"
        subtitle="Arena Labs — personalized picks based on trends"
      />
      <SpectrumPanel variant="purple" className="grid gap-4 p-6 md:grid-cols-3">
        {picks.map((d) => (
          <Link
            key={d.id}
            href={`/phones/${d.slug}`}
            className="arena-feature-card group block"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-accent-purple)] bg-[var(--aurora-purple)]/15">
              <Sparkles size={18} className="text-[var(--aurora-purple)]" />
            </div>
            <p className="mt-3 font-bold text-[var(--text-primary)] group-hover:text-[var(--electric-cyan)]">
              {d.name}
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Match score:{" "}
              <span className="font-semibold text-[var(--electric-cyan)]">
                {78 + (d.id % 20)}%
              </span>{" "}
              · {d.brand?.name}
            </p>
          </Link>
        ))}
        {picks.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] md:col-span-3">
            Sign in and browse devices to unlock AI recommendations.
          </p>
        )}
      </SpectrumPanel>
    </section>
  );
}

export function CommunityStreamSection() {
  const items = [
    { user: "TechFan42", action: "rated Volt Stride Pro 9.2/10", time: "2m ago" },
    { user: "NimbusFan", action: "joined Volt Mobile community", time: "8m ago" },
    { user: "ArenaLegend", action: "earned Reviewer badge", time: "15m ago" },
    { user: "CompareKing", action: "compared 3 flagships", time: "22m ago" },
  ];
  return (
    <section aria-labelledby="community-stream" className="arena-home-section">
      <SectionHeader
        title="Community Activity Stream"
        subtitle="Live participation across the Arena"
        href="/community"
      />
      <SpectrumPanel variant="accent" className="overflow-hidden">
        {items.map((item, index) => (
          <div
            key={item.user + item.time}
            className={`flex items-center gap-4 px-5 py-4 transition hover:bg-[var(--electric-cyan)]/5 ${
              index > 0 ? "border-t border-[var(--border-muted)]" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-accent)] bg-gradient-to-br from-[var(--arena-blue)] to-[var(--aurora-purple)] text-xs font-bold text-white shadow-lg shadow-[var(--arena-blue)]/20">
              {item.user.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--text-primary)]">
                <strong className="text-[var(--electric-cyan)]">{item.user}</strong>{" "}
                {item.action}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{item.time}</p>
            </div>
          </div>
        ))}
      </SpectrumPanel>
    </section>
  );
}

export function LaunchTimelineSection() {
  const launches = [
    { name: "Prism Horizon Max", date: "Jul 2026", status: "Rumored" },
    { name: "Echo Slate Fold", date: "Aug 2026", status: "Confirmed" },
    { name: "Volt Ember Lite", date: "Sep 2026", status: "Leaked" },
  ];
  return (
    <section aria-labelledby="launch-timeline" className="arena-home-section">
      <SectionHeader title="Upcoming Launch Timeline" subtitle="The release calendar" />
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
              <p className="mt-1 text-base font-bold text-[var(--text-primary)]">{l.name}</p>
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
  const items = [
    ...reviews.slice(0, 2).map((r) => ({
      href: `/reviews/${r.slug}`,
      title: r.title,
      type: "Review" as const,
    })),
    ...news.slice(0, 2).map((n) => ({
      href: `/news/${n.slug}`,
      title: n.title,
      type: "News" as const,
    })),
  ];

  return (
    <section aria-labelledby="editors-arena" className="arena-home-section">
      <SectionHeader
        title="Editor's Arena"
        subtitle="Curated by the MobileArena team"
        accent="gold"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="arena-editorial-card group flex items-start gap-4 p-5"
          >
            <span
              className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                item.type === "Review"
                  ? "border-[var(--border-accent-gold)] bg-[var(--premium-gold)]/15 text-[var(--premium-gold)]"
                  : "border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]"
              }`}
            >
              {item.type}
            </span>
            <p className="flex-1 font-semibold leading-snug text-[var(--text-primary)] transition group-hover:text-[var(--electric-cyan)]">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ReviewsPollsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section aria-labelledby="reviews-polls" className="arena-home-section">
      <SectionHeader title="User Reviews & Polls" href="/reviews" />
      <SpectrumPanel variant="purple" className="p-6">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Community poll · Which camera king wins in 2026?
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
                <div
                  className="arena-score-fill"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {reviews[0] && (
          <Link
            href={`/reviews/${reviews[0].slug}`}
            className="mt-4 inline-block text-sm font-semibold text-[var(--electric-cyan)] hover:underline"
          >
            Read latest review: {reviews[0].title}
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

export function ArenaFooterEcosystem() {
  return (
    <footer className="mt-8 border-t border-[var(--border-subtle)] pt-10">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-2xl font-extrabold text-[var(--text-primary)]">
            Mobile<span className="spectrum-text">Arena</span>
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Discover. Compare. Decide. Together. A premium, community-driven
            smartphone platform with an original identity.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--electric-cyan)]">
            Arena
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["Phones", "/phones"],
              ["Phone Finder", "/phone-finder"],
              ["Comparison Tools", "/compare"],
              ["Upcoming Devices", "/phones?upcoming=1"],
              ["News", "/news"],
              ["Reviews", "/reviews"],
              ["Community", "/community"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[var(--text-primary)] transition hover:text-[var(--electric-cyan)]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--aurora-purple)]">
            Community
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["Discussions", "/discussions"],
              ["Sign up", "/signup"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[var(--text-primary)] transition hover:text-[var(--electric-cyan)]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-[var(--text-secondary)]">
        © {new Date().getFullYear()} MobileArena · Titan Spectrum Design System
      </p>
    </footer>
  );
}
