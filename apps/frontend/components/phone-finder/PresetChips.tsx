"use client";

import { useTranslations } from "next-intl";

import { PresetChipGrid } from "@/components/phone-finder/PresetChipGrid";
import {
  applyPreset,
  DEFAULT_PHONE_FINDER_FILTERS,
  QUICK_DISCOVERY_PRESETS,
  type PhoneFinderFilters,
} from "@/features/phone-finder";

export function PresetChips({
  activePreset,
  onSelectPreset,
  className,
}: {
  activePreset: string | null;
  onSelectPreset: (id: string) => void;
  className?: string;
}) {
  const t = useTranslations("finder");

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          {t("presets.popularQuick")}
        </p>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {t("presets.picksCount", { count: QUICK_DISCOVERY_PRESETS.length })}
        </span>
      </div>
      <PresetChipGrid
        presets={QUICK_DISCOVERY_PRESETS}
        activeId={activePreset}
        onSelect={onSelectPreset}
        variant="cyan"
      />
    </div>
  );
}

export { applyPreset, DEFAULT_PHONE_FINDER_FILTERS };
export type { PhoneFinderFilters };
