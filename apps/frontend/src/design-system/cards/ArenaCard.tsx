"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Bell, Bookmark, Eye, Scale, Star, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import { arenaScoreLabel } from "@/lib/arena-score";
import { useCompare } from "@/lib/compare-context";
import { getToken } from "@/lib/api";

export type ArenaCardProps = {
  href: string;
  slug: string;
  deviceId: number;
  title: ReactNode;
  deviceName?: string;
  subtitle?: string;
  price?: string | null;
  image?: string | null;
  badge?: string;
  communityScore?: number;
  arenaScore?: number;
  chip?: string;
  specPreview?: string;
  inWishlist?: boolean;
  onToggleWishlist?: (deviceId: number) => void;
  wishlistLoading?: boolean;
};

export function ArenaCard({
  href,
  slug,
  deviceId,
  title,
  deviceName,
  subtitle,
  price,
  image,
  badge,
  communityScore,
  arenaScore,
  chip,
  specPreview,
  inWishlist = false,
  onToggleWishlist,
  wishlistLoading = false,
}: ArenaCardProps) {
  const router = useRouter();
  const { toggle, has } = useCompare();
  const inCompare = has(slug);

  const scoreBadge =
    arenaScore != null ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--premium-gold)]/30 bg-[var(--premium-gold)]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--premium-gold)]">
        <Trophy size={10} />
        Arena {arenaScore}
      </span>
    ) : null;

  function handleWishlist() {
    if (!getToken()) {
      router.push("/login?next=/phone-finder");
      return;
    }
    onToggleWishlist?.(deviceId);
  }

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="arena-card arena-device-card group relative overflow-hidden rounded-[22px] bg-[var(--surface-card)]/95 p-4 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--electric-cyan)]/20 blur-3xl transition duration-200 group-hover:bg-[var(--aurora-purple)]/30" />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {badge && (
          <span className="arena-badge inline-flex items-center gap-1">
            <Star size={12} className="text-[var(--premium-gold)]" />
            {badge}
          </span>
        )}
        {scoreBadge}
      </div>

      <Link href={href} className="block">
        <div className="relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-[18px] border border-[var(--border-muted)] bg-gradient-to-br from-[var(--arena-blue)]/15 via-[var(--surface-glow)] to-[var(--aurora-purple)]/15">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-full w-full object-contain p-4 transition duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="text-4xl opacity-40">📱</span>
          )}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--dark-space)]/90 via-transparent to-transparent p-3 opacity-0 transition duration-200 group-hover:opacity-100">
            <p className="text-xs text-[var(--text-secondary)]">
              {specPreview ?? chip ?? "Tap for full specifications"}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        )}
        {chip && (
          <p className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs text-[var(--electric-cyan)]">
            {chip}
          </p>
        )}
        {price && (
          <p className="mt-3 text-xl font-extrabold text-[var(--premium-gold)]">
            {price}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {communityScore != null && (
            <span className="flex items-center gap-1 text-[var(--emerald-success)]">
              <BarChart3 size={12} /> Community {communityScore}%
            </span>
          )}
          {arenaScore != null && (
            <span className="text-[var(--text-secondary)]">
              {arenaScoreLabel(arenaScore)}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex gap-2 border-t border-[var(--border-muted)] pt-3">
        <button
          type="button"
          onClick={() =>
            toggle({ id: deviceId, slug, name: deviceName ?? String(title) })
          }
          className={`arena-btn-ghost flex-1 text-xs ${inCompare ? "text-[var(--electric-cyan)]" : ""}`}
          aria-pressed={inCompare}
        >
          <Scale size={12} className="mr-1 inline" />
          {inCompare ? "Added" : "Compare"}
        </button>
        <button
          type="button"
          disabled={wishlistLoading}
          onClick={handleWishlist}
          className={`arena-btn-ghost flex-1 text-xs ${inWishlist ? "text-[var(--electric-cyan)]" : ""}`}
          title="Add to wishlist with price alerts"
        >
          {inWishlist ? (
            <Bell size={12} className="mr-1 inline" />
          ) : (
            <Bookmark size={12} className="mr-1 inline" />
          )}
          {wishlistLoading ? "…" : inWishlist ? "Saved" : "Wishlist"}
        </button>
        <Link href={href} className="arena-btn-ghost flex-1 text-center text-xs">
          <Eye size={12} className="mr-1 inline" />
          View
        </Link>
      </div>
    </motion.article>
  );
}
