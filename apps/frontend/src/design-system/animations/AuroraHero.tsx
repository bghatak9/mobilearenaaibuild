"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { DeviceBriefLink } from "@/components/device-brief/DeviceBriefLink";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import type { Device } from "@/lib/api";
import { formatCurrency } from "@/lib/format-locale";

type HeroDevice = Pick<Device, "id" | "slug" | "name" | "price" | "brand"> & {
  images?: { url: string }[];
};

type AuroraHeroProps = {
  featuredDevices?: HeroDevice[];
};

function CompactDeviceTile({
  device,
  delay = 0,
  featured = false,
}: {
  device: HeroDevice;
  delay?: number;
  featured?: boolean;
}) {
  const image = device.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={featured ? "z-10" : "z-0"}
    >
      <DeviceBriefLink
        href={`/phones/${device.slug}`}
        className={`aurora-hero-device-card group flex items-center gap-3 rounded-2xl p-2.5 transition duration-200 hover:-translate-y-0.5 ${ featured ? "border-[var(--border-accent)] shadow-[0_12px_32px_rgb(6_182_212/0.15)]" : "" }`}
      >
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-muted)] bg-gradient-to-br from-[var(--arena-blue)]/15 to-[var(--aurora-purple)]/15">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-lg opacity-40">📱</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[var(--text-primary)]">
            <DeviceName name={device.name} brand={device.brand?.name} />
          </p>
          <p className="truncate text-[10px] text-[var(--text-secondary)]">
            {device.brand?.name ? <BrandName name={device.brand.name} /> : null}
          </p>
          {device.price != null && (
            <p className="mt-0.5 text-xs font-extrabold text-[var(--premium-gold)]">
              {formatCurrency(device.price)}
            </p>
          )}
        </div>
      </DeviceBriefLink>
    </motion.div>
  );
}

export function AuroraHero({ featuredDevices = [] }: AuroraHeroProps) {
  const t = useTranslations("home");
  const showcase = featuredDevices.slice(0, 2);
  const tags = [
    t("hero.statDevices"),
    t("hero.statCompare"),
    t("hero.statCommunity"),
  ] as const;

  return (
    <section className="arena-gradient-ring arena-gradient-ring-compact overflow-hidden">
      <div className="arena-gradient-ring-inner relative overflow-hidden px-4 py-7 sm:px-6 sm:py-8 md:px-8">
        <div className="aurora-hero-bg absolute inset-0" aria-hidden />
        <div className="aurora-hero-mesh absolute inset-0 opacity-80" aria-hidden />

        <div
          className="aurora-hero-orb pointer-events-none absolute -right-10 -top-6 h-40 w-40 rounded-full bg-[var(--electric-cyan)]/25 blur-3xl"
          aria-hidden
        />
        <div
          className="aurora-hero-orb-delayed pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[var(--aurora-purple)]/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 lg:max-w-[58%]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--electric-cyan)]"
            >
              <Sparkles size={12} />
              {t("hero.eyebrow")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 }}
              className="aurora-hero-headline-glow mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-[2rem]"
            >
              {t("hero.titleBefore")}{" "}
              <span className="aurora-text">{t("hero.titleAccent")}</span>{" "}
              {t("hero.titleAfter")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              {t("hero.body")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <Link
                href="/phones"
                className="arena-btn-primary gap-1.5 px-4 py-2 text-xs sm:text-sm"
              >
                <Zap size={14} />
                {t("hero.explorePhones")}
              </Link>
              <Link
                href="/phone-finder"
                className="arena-btn-secondary gap-1.5 px-4 py-2 text-xs sm:text-sm"
              >
                {t("hero.phoneFinder")}
                <ArrowRight size={12} />
              </Link>
              <Link href="/compare" className="arena-btn-ghost px-3 py-2 text-xs">
                {t("hero.comparisonTools")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="mt-4 flex flex-wrap gap-1.5"
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="aurora-hero-stat rounded-full px-2.5 py-1 text-[10px] font-semibold text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-accent-purple)] bg-[var(--aurora-purple)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--aurora-purple)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald-success)] opacity-50" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--emerald-success)]" />
                </span>
                {t("hero.liveNow")}
              </span>
            </motion.div>
          </div>

          {showcase.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="relative w-full shrink-0 lg:w-[min(100%,340px)]"
            >
              <div className="aurora-hero-ring-compact absolute inset-2" aria-hidden />
              <div className="relative space-y-2">
                <CompactDeviceTile device={showcase[0]!} delay={0.14} featured />
                {showcase[1] && (
                  <CompactDeviceTile device={showcase[1]} delay={0.22} />
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
