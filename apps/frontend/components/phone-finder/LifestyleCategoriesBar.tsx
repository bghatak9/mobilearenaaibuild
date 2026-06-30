"use client";

import { PresetChipGrid } from "@/components/phone-finder/PresetChipGrid";
import { LIFESTYLE_PRESETS } from "@/features/phone-finder";

export function LifestyleCategoriesBar({
  activePreset,
  onSelectPreset,
  className,
}: {
  activePreset: string | null;
  onSelectPreset: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          Lifestyle categories
        </p>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {LIFESTYLE_PRESETS.length} picks
        </span>
      </div>
      <PresetChipGrid
        presets={LIFESTYLE_PRESETS}
        activeId={activePreset}
        onSelect={onSelectPreset}
        variant="emerald"
      />
    </div>
  );
}
