"use client";

type PriceRangeSliderProps = {
  min: number;
  max: number;
  minValue: number | null;
  maxValue: number | null;
  onChange: (min: number | null, max: number | null) => void;
};

export function PriceRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onChange,
}: PriceRangeSliderProps) {
  const lo = minValue ?? min;
  const hi = maxValue ?? max;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>${lo.toLocaleString()}</span>
        <span>${hi.toLocaleString()}</span>
      </div>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[var(--arena-blue)] to-[var(--electric-cyan)]"
          style={{
            left: `${((lo - min) / (max - min || 1)) * 100}%`,
            right: `${100 - ((hi - min) / (max - min || 1)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={lo}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), hi);
            onChange(next <= min ? null : next, maxValue);
          }}
          className="pointer-events-auto absolute inset-0 z-10 w-full opacity-0"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={hi}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo);
            onChange(minValue, next >= max ? null : next);
          }}
          className="pointer-events-auto absolute inset-0 z-20 w-full opacity-0"
          aria-label="Maximum price"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min={min}
          max={max}
          placeholder="Min"
          value={minValue ?? ""}
          onChange={(e) =>
            onChange(
              e.target.value ? Number(e.target.value) : null,
              maxValue,
            )
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <input
          type="number"
          min={min}
          max={max}
          placeholder="Max"
          value={maxValue ?? ""}
          onChange={(e) =>
            onChange(
              minValue,
              e.target.value ? Number(e.target.value) : null,
            )
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </div>
    </div>
  );
}
