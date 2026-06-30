"use client";

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
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          Popular quick filters
        </p>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {QUICK_DISCOVERY_PRESETS.length} picks
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
