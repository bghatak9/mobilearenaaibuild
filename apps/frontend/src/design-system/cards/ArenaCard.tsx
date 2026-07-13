"use client";

import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Bell, Bookmark, Eye, Scale, Star, Trophy } from "lucide-react";

import { cn } from "@/design-system/utils/cn";
import { TechnicalText } from "@/components/i18n/TechnicalText";
import { arenaScoreLabel } from "@/lib/arena-score";
import { useCompare } from "@/lib/compare-context";
import { useClientMounted } from "@/hooks/useClientMounted";
import { getToken } from "@/lib/api";
import { useSiteLanguage } from "@/lib/site-language";

export type ArenaCardLayout = "vertical" | "horizontal";

export type ArenaCardProps = {
  href: string;
  slug: string;
  deviceId: number;
  title: ReactNode;
  deviceName?: string;
  subtitle?: ReactNode;
  price?: string | null;
  image?: string | null;
  badge?: string;
  communityScore?: number;
  arenaScore?: number;
  chip?: string;
  specPreview?: string;
  layout?: ArenaCardLayout;
  compact?: boolean;
  dense?: boolean;
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
  layout = "vertical",
  compact = false,
  dense = false,
  inWishlist = false,
  onToggleWishlist,
  wishlistLoading = false,
}: ArenaCardProps) {
  const isHorizontal = layout === "horizontal";
  const isCompact = compact && isHorizontal;
  const isStrip = compact && !isHorizontal;
  const isDense = dense && !isHorizontal && !isCompact && !isStrip;
  const router = useRouter();
  const { toggle, has } = useCompare();
  const mounted = useClientMounted();
  const { t } = useSiteLanguage();
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

  const badgeRow = (badge || scoreBadge) && (
    <div
      className={cn(
        "flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden",
        isHorizontal ? (isCompact ? "mb-1" : "mb-2") : isStrip ? "mb-1.5" : isDense ? "mb-2" : "mb-3",
      )}
    >
      {badge && (
        <span
          className={cn(
            "arena-badge inline-flex max-w-full items-center gap-1 overflow-hidden",
            (isCompact || isStrip) && "px-1.5 py-0.5 text-[9px]",
            isStrip && "truncate",
          )}
        >
          <Star
            size={isCompact || isStrip ? 10 : 12}
            className="shrink-0 text-[var(--premium-gold)]"
          />
          <span className={isStrip ? "truncate" : undefined}>{badge}</span>
        </span>
      )}
      {scoreBadge}
    </div>
  );

  const imageBlock = (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--titan-radius-image)] border border-[var(--border-soft)] bg-[var(--bg-secondary)]",
        isHorizontal
          ? isCompact
            ? "h-14 w-14"
            : "h-[4.75rem] w-[4.75rem] sm:h-28 sm:w-[7.5rem]"
          : isStrip
            ? "mb-1.5 h-[4.5rem] w-full"
            : isDense
              ? "mb-3 h-32 w-full"
              : "mb-4 h-40 w-full",
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className={cn(
            "h-full w-full object-contain transition duration-200 group-hover:scale-105",
            isHorizontal ? (isCompact ? "p-1" : "p-2") : isStrip ? "p-2" : isDense ? "p-3" : "p-4",
          )}
        />
      ) : (
        <span
          className={cn(
            "opacity-25",
            isHorizontal ? "text-2xl" : isStrip ? "text-xl" : "text-3xl",
          )}
          aria-hidden
        >
          📱
        </span>
      )}
      {!isHorizontal && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--dark-space)]/90 via-transparent to-transparent p-3 opacity-0 transition duration-200 group-hover:opacity-100">
          <p className="text-xs text-[var(--text-secondary)]">
            {specPreview || chip ? (
              <TechnicalText value={specPreview ?? chip} />
            ) : (
              t("card.viewDevice")
            )}
          </p>
        </div>
      )}
    </div>
  );

  const iconOnlyActions = isCompact || isStrip || isDense;

  const metaBlock = (
    <div
      className={cn(
        "arena-device-card__meta min-w-0 overflow-hidden",
        isHorizontal && "flex-1",
      )}
    >
      <h3
        className={cn(
          "break-words font-semibold text-[var(--text-primary)]",
          isHorizontal
            ? isCompact
              ? "line-clamp-2 text-[11px] leading-[1.35]"
              : "text-sm sm:text-base"
            : isStrip
              ? "line-clamp-2 text-[11px] leading-[1.35]"
              : isDense
                ? "line-clamp-2 text-sm leading-[1.35]"
                : "line-clamp-2 text-base leading-snug",
        )}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className={cn(
            "text-[var(--text-secondary)]",
            isStrip ? "mt-0.5 line-clamp-1 text-[10px]" : isDense ? "mt-0.5 text-xs" : "mt-0.5 text-sm",
          )}
        >
          {subtitle}
        </p>
      )}
      {isHorizontal && !isCompact && (specPreview ?? chip) && (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
          <TechnicalText value={specPreview ?? chip} />
        </p>
      )}
      {!isHorizontal && chip && !isStrip && (
        <span
          className={cn(
            "titan-chip max-w-full text-[var(--text-secondary)]",
            isDense ? "mt-1.5 block truncate text-[11px]" : "mt-2",
          )}
        >
          <TechnicalText value={chip} />
        </span>
      )}
      {price && (
        <p
          className={cn(
            "titan-mono font-semibold text-[var(--text-primary)]",
            isHorizontal
              ? isCompact
                ? "mt-0.5 text-xs"
                : "mt-1.5 text-base"
              : isStrip
                ? "mt-0.5 text-[11px]"
                : isDense
                ? "mt-2 text-base"
                : "mt-3 text-lg",
          )}
        >
          {price}
        </p>
      )}
      {!isCompact && !isStrip && !isDense && (
        <div className={cn("flex flex-wrap gap-3 text-xs", isHorizontal ? "mt-1" : "mt-2")}>
          {communityScore != null && (
            <span className="flex items-center gap-1 text-[var(--emerald-success)]">
              <BarChart3 size={12} /> {t("card.community")} {communityScore}%
            </span>
          )}
          {arenaScore != null && (
            <span className="text-[var(--text-secondary)]">{arenaScoreLabel(arenaScore)}</span>
          )}
        </div>
      )}
    </div>
  );

  const actionRow = (
    <div
      className={cn(
        "arena-device-card__actions flex min-w-0 gap-1 border-t border-[var(--border-muted)] sm:gap-2",
        isHorizontal ? (isCompact ? "mt-1.5 pt-1.5" : "mt-3 pt-2.5") : isStrip ? "mt-1.5 pt-1.5" : isDense ? "mt-auto pt-2.5" : "mt-4 pt-3",
      )}
    >
        <button
          type="button"
          onClick={() =>
            toggle({ id: deviceId, slug, name: deviceName ?? String(title) })
          }
          className={cn(
            "arena-btn-ghost min-w-0 flex-1 basis-0",
            iconOnlyActions ? "px-0.5 py-1 text-[0px]" : "px-1 text-[10px] sm:px-2 sm:text-xs",
            inCompare && "text-[var(--blue)]",
          )}
          aria-pressed={inCompare}
          aria-label={inCompare ? t("card.addedCompare") : t("card.addCompare")}
          title={inCompare ? t("card.addedCompare") : t("card.compare")}
        >
          <Scale size={iconOnlyActions ? 14 : 12} className={iconOnlyActions ? "mx-auto" : "mr-1 inline"} />
          {!iconOnlyActions && (inCompare ? t("card.added") : t("card.compare"))}
        </button>
        <button
          type="button"
          disabled={wishlistLoading}
          onClick={handleWishlist}
          className={cn(
            "arena-btn-ghost min-w-0 flex-1 basis-0",
            iconOnlyActions ? "px-0.5 py-1 text-[0px]" : "px-1 text-[10px] sm:px-2 sm:text-xs",
            inWishlist && "text-[var(--blue)]",
          )}
          title={t("card.addWishlist")}
          aria-label={inWishlist ? t("card.savedWishlist") : t("card.addWishlist")}
        >
          {inWishlist ? (
            <Bell size={iconOnlyActions ? 14 : 12} className={iconOnlyActions ? "mx-auto" : "mr-1 inline"} />
          ) : (
            <Bookmark size={iconOnlyActions ? 14 : 12} className={iconOnlyActions ? "mx-auto" : "mr-1 inline"} />
          )}
          {!iconOnlyActions && (wishlistLoading ? "…" : inWishlist ? t("card.saved") : t("card.wishlist"))}
        </button>
        <Link
          href={href}
          className={cn(
            "arena-btn-ghost min-w-0 flex-1 basis-0 text-center",
            iconOnlyActions ? "px-0.5 py-1 text-[0px]" : "px-1 text-[10px] sm:px-2 sm:text-xs",
          )}
          aria-label={t("card.viewDevice")}
          title={t("card.viewDevice")}
        >
          <Eye size={iconOnlyActions ? 14 : 12} className={iconOnlyActions ? "mx-auto" : "mr-1 inline"} />
          {!iconOnlyActions && t("card.view")}
        </Link>
    </div>
  );

  return (
    <motion.article
      initial={false}
      whileHover={mounted && !isCompact && !isStrip && !isDense ? { y: isHorizontal ? 0 : -2 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "arena-card arena-device-card titan-card group relative w-full min-w-0 max-w-full overflow-hidden",
        isHorizontal
          ? cn("arena-device-card--horizontal", isCompact ? "p-2" : "p-3 sm:p-4")
          : isStrip
            ? "arena-device-card--strip flex h-full flex-col p-2.5"
            : isDense
              ? "arena-device-card--dense flex h-full flex-col p-3"
              : "p-4",
      )}
    >
      {isStrip ? (
        <>
          {badgeRow}
          <Link href={href} className="block min-w-0 flex-1 overflow-hidden">
            {imageBlock}
            {metaBlock}
          </Link>
          {actionRow}
        </>
      ) : (
        <>
      {badgeRow}

      {isHorizontal ? (
        <Link href={href} className={cn("flex min-w-0 flex-1", isCompact ? "gap-2" : "gap-2.5 sm:gap-3")}>
          {imageBlock}
          {metaBlock}
        </Link>
      ) : (
        <Link
          href={href}
          className={cn(
            "block min-w-0 overflow-hidden",
            isDense && "min-h-0 flex-1",
          )}
        >
          {imageBlock}
          {metaBlock}
        </Link>
      )}

      {actionRow}
        </>
      )}
    </motion.article>
  );
}
