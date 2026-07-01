"use client";

import Link from "next/link";
import { Play, X } from "lucide-react";
import { useState } from "react";

import type { PaidAdvertisement } from "@/lib/api";
import AdLabel from "@/components/ads/AdLabel";
import { useAdImpression } from "@/components/ads/useAdImpression";
import { adDisplayVariant } from "@/lib/ad-utils";
import { resolvePlacementMeta } from "@/lib/ad-catalog";
import { getAdClickUrl, handleAdClick } from "@/lib/ad-tracking";
import { useCompare } from "@/lib/compare-context";

type AdUnitProps = {
  ad: PaidAdvertisement | null | undefined;
  variant?: "banner" | "card" | "inline" | "skyscraper" | "affiliate" | "video";
  className?: string;
  showPlaceholder?: boolean;
};

function bannerMinHeight(ad: PaidAdvertisement | null | undefined): string {
  const h = ad?.height ?? resolvePlacementMeta(ad?.placement ?? "")?.height;
  if (!h) return "min-h-[72px] sm:min-h-[90px]";
  if (h <= 50) return "min-h-[50px]";
  if (h <= 90) return "min-h-[72px] sm:min-h-[90px]";
  if (h <= 250) return "min-h-[180px] sm:min-h-[220px]";
  return "min-h-[300px]";
}

function TrackedShell({
  ad,
  children,
  className = "",
}: {
  ad: PaidAdvertisement;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useAdImpression(ad.id, ad.placement);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function useAdLinkProps(ad: PaidAdvertisement) {
  const clickUrl = getAdClickUrl(ad.id, ad.placement);
  const isSponsored =
    ad.sponsored || ad.adType === "sponsored" || ad.adType === "affiliate";
  const rel = isSponsored ? "noopener noreferrer sponsored" : "noopener noreferrer";
  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handleAdClick(event, clickUrl);
  };
  return { clickUrl, rel, onClick, isSponsored };
}

function adCta(ad: PaidAdvertisement): string {
  if (ad.adType === "affiliate") return "Buy now";
  if (ad.advertiser) return `Visit ${ad.advertiser}`;
  return "Learn more";
}

function AdImage({
  ad,
  className = "",
  titleClassName = "px-4 text-center text-sm font-semibold text-zinc-700 group-hover:text-red-600 dark:text-zinc-200",
}: {
  ad: PaidAdvertisement;
  className?: string;
  titleClassName?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(ad.imageUrl) && !imageFailed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ad.imageUrl!}
        alt=""
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <span className={titleClassName}>{ad.title}</span>;
}

function AdTrackedLink({
  ad,
  className,
  children,
}: {
  ad: PaidAdvertisement;
  className: string;
  children: React.ReactNode;
}) {
  const { clickUrl, rel, onClick } = useAdLinkProps(ad);
  return (
    <Link
      href={clickUrl}
      target="_blank"
      rel={rel}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
}

export default function AdUnit({
  ad,
  variant,
  className = "",
  showPlaceholder = true,
}: AdUnitProps) {
  if (!ad) {
    if (!showPlaceholder) return null;
    const placeholderVariant = variant ?? "banner";
    if (placeholderVariant === "card" || placeholderVariant === "affiliate") {
      return (
        <div
          className={`flex h-[220px] flex-col items-start justify-center gap-3 rounded-md border border-gray-200 bg-white p-5 text-gray-400 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
        >
          <AdLabel />
          <p className="text-sm">Ad space available</p>
        </div>
      );
    }
    if (placeholderVariant === "skyscraper") {
      return (
        <div
          className={`flex min-h-[400px] flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-4 text-gray-300 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
        >
          <AdLabel />
          <p className="mt-2 text-xs">160×600</p>
        </div>
      );
    }
    return (
      <div className={className}>
        <AdLabel className="mb-1 text-center" />
        <div
          className={`flex items-center justify-center rounded border border-gray-200 bg-white text-sm text-gray-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600 ${bannerMinHeight(ad)}`}
        >
          Ad
        </div>
      </div>
    );
  }

  const resolvedVariant = variant ?? adDisplayVariant(ad);
  const cta = adCta(ad);
  const { isSponsored } = useAdLinkProps(ad);

  if (resolvedVariant === "video" || ad.adType === "video") {
    return (
      <TrackedShell ad={ad} className={className}>
        <AdLabel sponsored={isSponsored} className="mb-1" />
        <AdTrackedLink
          ad={ad}
          className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-zinc-900 text-white dark:border-zinc-700"
        >
          <AdImage
            ad={ad}
            className="h-full w-full object-cover opacity-80"
            titleClassName="sr-only"
          />
          <span className="absolute flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold">
            <Play size={16} className="fill-white" /> {ad.title}
          </span>
        </AdTrackedLink>
      </TrackedShell>
    );
  }

  if (resolvedVariant === "affiliate" || ad.adType === "affiliate") {
    return (
      <TrackedShell ad={ad} className={className}>
        <AdTrackedLink
          ad={ad}
          className="group inline-flex w-full items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 transition hover:border-emerald-400 hover:shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30"
        >
          <AdLabel sponsored className="mb-0" />
          <span className="font-semibold text-emerald-900 dark:text-emerald-100">{ad.title}</span>
          <span className="ml-auto rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white group-hover:bg-emerald-500">
            {cta}
          </span>
        </AdTrackedLink>
      </TrackedShell>
    );
  }

  if (
    resolvedVariant === "card" ||
    ad.adType === "native" ||
    ad.adType === "featured" ||
    ad.adType === "sponsored"
  ) {
    return (
      <TrackedShell ad={ad} className={className}>
        <AdTrackedLink
          ad={ad}
          className="group flex h-[220px] flex-col overflow-hidden rounded-md border border-amber-200 bg-gradient-to-br from-amber-300 to-yellow-200 p-5 transition hover:shadow-md dark:border-amber-900/40 dark:from-amber-900/40 dark:to-yellow-900/30"
        >
          <AdLabel sponsored={isSponsored} />
          <div className="relative mt-2 h-24 w-full overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
            <AdImage
              ad={ad}
              className="h-full w-full object-contain object-center"
              titleClassName="flex h-full items-center justify-center px-3 text-center text-sm font-semibold text-amber-900 dark:text-amber-100"
            />
          </div>
          <p className="mt-2 line-clamp-2 text-xl font-extrabold text-amber-900 dark:text-amber-100">
            {ad.title}
          </p>
          <span className="mt-auto rounded bg-red-600 px-4 py-1.5 text-sm font-semibold text-white group-hover:bg-red-700">
            {cta}
          </span>
        </AdTrackedLink>
      </TrackedShell>
    );
  }

  if (resolvedVariant === "skyscraper") {
    return (
      <TrackedShell ad={ad} className={className}>
        <AdLabel sponsored={isSponsored} className="mb-1 text-center" />
        <AdTrackedLink
          ad={ad}
          className="group flex min-h-[400px] flex-col overflow-hidden rounded border border-gray-200 bg-white transition hover:border-red-300 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <AdImage
            ad={ad}
            className="h-full w-full object-cover"
            titleClassName="flex flex-1 flex-col items-center justify-center p-4 text-center font-semibold text-zinc-800 dark:text-zinc-100"
          />
        </AdTrackedLink>
      </TrackedShell>
    );
  }

  if (resolvedVariant === "inline") {
    return (
      <TrackedShell ad={ad} className={className}>
        <AdLabel sponsored={isSponsored} className="mb-1 text-center" />
        <AdTrackedLink
          ad={ad}
          className={`group flex w-full items-center justify-center overflow-hidden rounded border border-gray-200 bg-white transition hover:border-red-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${bannerMinHeight(ad)}`}
        >
          <AdImage
            ad={ad}
            className="h-full w-full object-contain object-center"
          />
        </AdTrackedLink>
      </TrackedShell>
    );
  }

  return (
    <TrackedShell ad={ad} className={className}>
      <AdLabel sponsored={isSponsored} className="mb-1 text-center" />
      <AdTrackedLink
        ad={ad}
        className={`group flex w-full items-center justify-center overflow-hidden rounded border border-gray-200 bg-white transition hover:border-red-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${bannerMinHeight(ad)}`}
      >
        <AdImage ad={ad} className="h-full w-full object-contain object-center" />
      </AdTrackedLink>
    </TrackedShell>
  );
}

type StickyAdBarProps = {
  ad: PaidAdvertisement | null | undefined;
};

export function StickyAdBar({ ad }: StickyAdBarProps) {
  const [dismissed, setDismissed] = useState(false);
  const { items } = useCompare();

  if (!ad || dismissed || items.length > 0) return null;

  return (
    <div
      id="arena-sticky-ad-bar"
      className="arena-mobile-sticky-ad-offset fixed inset-x-0 z-40 border-t border-gray-200 bg-white/95 p-2 shadow-lg backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div className="relative mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute -top-1 right-0 rounded p-1 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss ad"
        >
          <X size={16} />
        </button>
        <AdUnit ad={ad} showPlaceholder={false} />
      </div>
    </div>
  );
}
