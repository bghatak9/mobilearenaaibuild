"use client";

import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  BatteryCharging,
  Brain,
  Calendar,
  Camera,
  Cpu,
  ExternalLink,
  HardDrive,
  MessageSquare,
  MonitorSmartphone,
  Scale,
  Share2,
  Smartphone,
  Sparkles,
  Tag,
  Trophy,
  X,
} from "lucide-react";

import { buildDeviceBrief } from "@/features/device-brief";
import type { DeviceBriefAffiliateOffer } from "@/features/device-brief";
import { DeviceBriefVisual } from "@/components/device-brief/DeviceBriefVisual";
import type { PriceCurrency } from "@/features/phone-finder/types";
import { formatPriceAmount } from "@/features/phone-finder/device-utils";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import { TechnicalText } from "@/components/i18n/TechnicalText";
import { localizeTechnicalText } from "@/features/i18n";
import { useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";

const META_ICONS = [Tag, Calendar, Smartphone, HardDrive, Cpu] as const;

function scoreRingStyle(score: number): CSSProperties {
  const pct = Math.min(100, Math.max(0, score));
  return {
    background: `conic-gradient(var(--premium-gold) ${pct * 3.6}deg, color-mix(in srgb, var(--border-soft) 80%, transparent) 0)`,
  };
}
const PILLAR_ICONS = {
  vision: MonitorSmartphone,
  optics: Camera,
  compute: Cpu,
  endurance: BatteryCharging,
} as const;

type ActionId = "intelligence" | "compare" | "discussions" | "pricing";

type Props = {
  device: Device;
  currency?: PriceCurrency;
  className?: string;
  layout?: "strip" | "stacked";
  onClose?: () => void;
  onShare?: () => void;
  onAction?: (action: ActionId) => void;
  inCompare?: boolean;
  compareDisabled?: boolean;
  /** Hide footer when embedded on detail page with external actions */
  showFooter?: boolean;
};

function PulseStat({
  label,
  value,
  accent = false,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="arena-brief__pulse-block">
      {icon ? (
        <span className="arena-brief__pulse-icon" aria-hidden>
          {icon}
        </span>
      ) : (
        <span className="arena-brief__pulse-icon arena-brief__pulse-icon--spacer" aria-hidden />
      )}
      <p className="arena-brief__pulse-label">
        <TechnicalText value={label} />
      </p>
      <p
        className={cn(
          "arena-brief__pulse-value",
          accent && "arena-brief__pulse-value--accent",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function BriefAffiliate({ offers }: { offers: DeviceBriefAffiliateOffer[] }) {
  if (offers.length === 0) return null;

  return (
    <div className="arena-brief__affiliate" aria-label="Partner buy links">
      <p className="arena-brief__affiliate-label">
        <TechnicalText value="Buy from partners" />
      </p>
      <ul className="arena-brief__affiliate-list">
        {offers.slice(0, 3).map((offer) => (
          <li key={`${offer.partner}-${offer.affiliateUrl}`}>
            <a
              href={offer.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="arena-brief__affiliate-link"
            >
              <span className="arena-brief__affiliate-partner">{offer.partner}</span>
              <span className="arena-brief__affiliate-price">
                {formatPriceAmount(offer.price, offer.currency)}
              </span>
              <ExternalLink size={13} className="arena-brief__affiliate-icon" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BriefPulse({
  satisfaction,
  rebuyLabel,
}: {
  satisfaction: string;
  rebuyLabel: string;
}) {
  return (
    <div className="arena-brief__pulse arena-brief__pulse--corner">
      <PulseStat
        label="Owner satisfaction"
        value={satisfaction}
        icon={<Sparkles size={14} className="text-[var(--electric-cyan)]" />}
      />
      <div className="arena-brief__pulse-divider" aria-hidden />
      <PulseStat label="Would buy again" value={rebuyLabel} accent />
    </div>
  );
}

export function DeviceArenaBrief({
  device,
  currency = "USD",
  className,
  layout = "stacked",
  onClose,
  onShare,
  onAction,
  inCompare = false,
  compareDisabled = false,
  showFooter = true,
}: Props) {
  const { resolved } = useSiteLanguage();
  const brief = buildDeviceBrief(device, currency);
  const deviceHref = `/phones/${brief.slug}`;
  const shareLabel = localizeTechnicalText("Share device", resolved);
  const closeLabel = localizeTechnicalText("Close", resolved);

  function handleShare() {
    if (onShare) {
      onShare();
      return;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({
        title: brief.name,
        url: `${window.location.origin}${deviceHref}`,
      });
    }
  }

  const footerActions: {
    id: ActionId;
    label: string;
    icon: typeof Brain;
    href?: string;
    disabled?: boolean;
    active?: boolean;
  }[] = [
    {
      id: "intelligence",
      label: "Intelligence",
      icon: Brain,
      href: `${deviceHref}#intelligence`,
    },
    {
      id: "compare",
      label: inCompare ? "In compare" : "Compare",
      icon: Scale,
      disabled: compareDisabled,
      active: inCompare,
    },
    {
      id: "discussions",
      label: "Discussions",
      icon: MessageSquare,
      href: `${deviceHref}#community`,
    },
    {
      id: "pricing",
      label: "Market price",
      icon: Tag,
      href: `${deviceHref}#pricing`,
    },
  ];

  return (
    <article
      className={cn(
        "arena-brief",
        layout === "strip" && "arena-brief--strip",
        className,
      )}
      aria-label={`${brief.name} arena brief`}
    >
      <header className="arena-brief__header">
        <div className="arena-brief__identity min-w-0">
          {brief.brand ? (
            <p className="arena-brief__brand">
              <BrandName name={brief.brand} />
            </p>
          ) : null}
          <div className="arena-brief__title-row">
            <h2 className="arena-brief__title">
              <DeviceName name={brief.name} brand={brief.brand} />
            </h2>
            {brief.category ? (
              <span className="arena-brief__category-pill">
                <TechnicalText value={brief.category} />
              </span>
            ) : null}
          </div>
        </div>

        <aside className="arena-brief__header-aside">
          <div className="arena-brief__header-actions">
            <div
              className="arena-brief__score-ring"
              style={scoreRingStyle(brief.arenaScore)}
              title={brief.arenaTier}
            >
              <div className="arena-brief__score-inner">
                <Trophy size={12} className="text-[var(--premium-gold)]" aria-hidden />
                <span className="arena-brief__score-value">{brief.arenaScore}</span>
              </div>
            </div>
            <div className="arena-brief__icon-btn-row">
              <button
                type="button"
                className="arena-brief__icon-btn"
                onClick={handleShare}
                aria-label={shareLabel}
              >
                <Share2 size={16} />
              </button>
              {onClose ? (
                <button
                  type="button"
                  className="arena-brief__icon-btn"
                  onClick={onClose}
                  aria-label={closeLabel}
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      </header>

      <div className="arena-brief__main-strip">
        <DeviceBriefVisual
          brief={brief}
          deviceName={device.name}
          compact={layout === "strip"}
          fitFrame
        />

        <div className="arena-brief__meta-col">
          <ul
            className={cn(
              "arena-brief__meta",
              layout !== "strip" && "arena-brief__meta--stacked",
            )}
          >
            {brief.meta.map((line, index) => {
              const Icon = META_ICONS[index % META_ICONS.length];
              return (
                <li key={line.text}>
                  <Icon size={15} aria-hidden />
                  <TechnicalText value={line.text} />
                </li>
              );
            })}
          </ul>
          <BriefPulse
            satisfaction={brief.satisfaction}
            rebuyLabel={brief.rebuyLabel}
          />
          <BriefAffiliate offers={brief.affiliateOffers} />
        </div>
      </div>

      <div className="arena-brief__spec-bar">
        {brief.pillars.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.id];
          return (
            <div
              key={pillar.id}
              className="arena-brief__spec-cell"
              style={{ "--pillar-accent": `var(${pillar.accentVar})` } as CSSProperties}
            >
              <div className="arena-brief__spec-head">
                <Icon size={14} aria-hidden />
                <TechnicalText value={pillar.label} />
              </div>
              <p className="arena-brief__spec-headline">
                <TechnicalText value={pillar.headline} />
              </p>
              <p className="arena-brief__spec-detail">
                <TechnicalText value={pillar.detail} />
              </p>
            </div>
          );
        })}
      </div>

      {showFooter ? (
        <footer className="arena-brief__footer">
          {footerActions.map((action) => {
            const Icon = action.icon;
            const className = cn(
              "arena-brief__footer-btn",
              action.active && "arena-brief__footer-btn--active",
              action.disabled && "arena-brief__footer-btn--disabled",
            );

            if (action.href && action.id !== "compare") {
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={className}
                  onClick={() => onAction?.(action.id)}
                >
                  <Icon size={15} aria-hidden />
                  <TechnicalText value={action.label} />
                </Link>
              );
            }

            return (
              <button
                key={action.id}
                type="button"
                className={className}
                disabled={action.disabled}
                onClick={() => onAction?.(action.id)}
              >
                <Icon size={15} aria-hidden />
                <TechnicalText value={action.label} />
              </button>
            );
          })}
        </footer>
      ) : null}
    </article>
  );
}
