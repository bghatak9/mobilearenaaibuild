"use client";

import { Sparkles } from "lucide-react";

import { DeviceBriefLink } from "@/components/device-brief/DeviceBriefLink";
import type { Device } from "@/lib/api";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import { useSiteLanguage } from "@/lib/site-language";

export function DeviceBriefFeatureLink({ device }: { device: Device }) {
  const { t } = useSiteLanguage();

  return (
    <DeviceBriefLink
      href={`/phones/${device.slug}`}
      className="arena-feature-card group block"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-accent-purple)] bg-[var(--aurora-purple)]/15">
        <Sparkles size={18} className="text-[var(--aurora-purple)]" />
      </div>
      <p className="mt-3 font-bold text-[var(--text-primary)] group-hover:text-[var(--electric-cyan)]">
        <DeviceName name={device.name} brand={device.brand?.name} />
      </p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        {t("home.matchScore")}:{" "}
        <span className="font-semibold text-[var(--electric-cyan)]">
          {78 + (device.id % 20)}%
        </span>{" "}
        · {device.brand?.name ? <BrandName name={device.brand.name} /> : null}
      </p>
    </DeviceBriefLink>
  );
}
