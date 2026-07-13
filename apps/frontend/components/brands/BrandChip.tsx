"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ComponentPropsWithoutRef } from "react";

import type { BrandSummary } from "@/lib/api";
import { getBrandVisual } from "@/lib/brand-visuals";
import { localizeBrandName } from "@/features/i18n";
import { cn } from "@/design-system/utils/cn";
import { useSiteLanguage } from "@/lib/site-language";

type BrandChipSize = "sm" | "md" | "lg";

const sizeStyles: Record<
  BrandChipSize,
  { root: string; mark: string; text: string; logo: number }
> = {
  sm: {
    root: "gap-2 px-2.5 py-1.5",
    mark: "h-6 w-6 text-[10px]",
    text: "text-xs",
    logo: 18,
  },
  md: {
    root: "gap-2.5 px-3.5 py-2.5",
    mark: "h-8 w-8 text-xs",
    text: "text-sm",
    logo: 22,
  },
  lg: {
    root: "gap-3 px-4 py-3.5",
    mark: "h-10 w-10 text-sm",
    text: "text-base",
    logo: 28,
  },
};

type BrandChipProps = {
  brand: BrandSummary;
  active?: boolean;
  size?: BrandChipSize;
  variant?: "showcase" | "filter";
  className?: string;
} & (
  | ({ as?: "button" } & ComponentPropsWithoutRef<"button">)
  | ({ as: "link"; href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">)
);

function BrandMark({
  brand,
  size,
  visual,
}: {
  brand: BrandSummary;
  size: BrandChipSize;
  visual: ReturnType<typeof getBrandVisual>;
}) {
  const styles = sizeStyles[size];

  if (brand.logo) {
    return (
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/90",
          styles.mark,
        )}
      >
        <Image
          src={brand.logo}
          alt=""
          width={styles.logo}
          height={styles.logo}
          className="h-full w-full object-contain p-0.5"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 font-bold text-white shadow-inner",
        styles.mark,
      )}
      style={{ background: visual.gradient }}
      aria-hidden
    >
      <span className="relative z-10">{visual.monogram}</span>
      <span
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, white 0%, transparent 55%)",
        }}
      />
    </span>
  );
}

export function BrandChip({
  brand,
  active = false,
  size = "md",
  variant = "showcase",
  className,
  ...props
}: BrandChipProps) {
  const visual = getBrandVisual(brand);
  const styles = sizeStyles[size];
  const { t, resolved } = useSiteLanguage();
  const label = localizeBrandName(brand.name, resolved);
  const isFilter = variant === "filter";

  const chipClass = cn(
    "group inline-flex items-center rounded-2xl border transition duration-200",
    !isFilter && "hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
    isFilter ? "w-full" : "",
    isFilter ? "gap-2 px-2.5 py-2" : styles.root,
    active
      ? "border-[var(--border-accent)] bg-[var(--arena-blue)]/20 text-[var(--electric-cyan)] shadow-[0_0_0_1px_rgb(6_182_212/0.2)]"
      : "border-[var(--border-subtle)] bg-[var(--surface-card)]/60 text-[var(--text-primary)] hover:border-[var(--border-accent)] hover:shadow-[var(--card-shadow)]",
    className,
  );

  const content = (
    <>
      <BrandMark brand={brand} size={isFilter ? "sm" : size} visual={visual} />
      <span className="min-w-0 flex-1 text-left leading-tight">
        <span
          className={cn(
            "arena-brand-name notranslate block font-bold tracking-tight",
            isFilter ? "text-xs" : styles.text,
            isFilter
              ? active
                ? undefined
                : "text-[var(--text-primary)]"
              : undefined,
          )}
          translate="no"
          style={!isFilter && !active ? { color: visual.accent } : undefined}
        >
          {label}
        </span>
        {!isFilter && (
          <span
            className={cn(
              "block text-[10px] font-medium uppercase tracking-[0.18em]",
              active ? "text-[var(--electric-cyan)]/80" : "text-[var(--text-secondary)]",
            )}
          >
            {t("home.explore")}
          </span>
        )}
      </span>
      {!isFilter && (
        <span
          className="ml-auto h-8 w-1 rounded-full opacity-80 transition group-hover:opacity-100"
          style={{ background: visual.gradient }}
          aria-hidden
        />
      )}
    </>
  );

  if (props.as === "link") {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={chipClass} {...linkProps}>
        {content}
      </Link>
    );
  }

  const { as: _as, ...buttonProps } = props as ComponentPropsWithoutRef<"button"> & {
    as?: "button";
  };

  return (
    <button type="button" className={chipClass} {...buttonProps}>
      {content}
    </button>
  );
}

export function BrandCategoryHeading({
  name,
  count,
  className,
}: {
  name: string;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-accent)] to-transparent opacity-60" />
      <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--electric-cyan)]">
        {name}
        {count != null ? ` · ${count}` : ""}
      </p>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-accent-purple)] to-transparent opacity-60" />
    </div>
  );
}
