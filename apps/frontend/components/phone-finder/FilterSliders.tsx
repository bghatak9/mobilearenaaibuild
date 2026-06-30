"use client";

import { cn } from "@/design-system/utils/cn";

const sliderThumbPaint =
  "[&::-webkit-slider-thumb]:bg-[linear-gradient(135deg,var(--arena-blue),var(--electric-cyan))] [&::-moz-range-thumb]:bg-[linear-gradient(135deg,var(--arena-blue),var(--electric-cyan))]";

const trackClass = [
  "h-1.5 w-full appearance-none rounded-full bg-white/10",
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/80",
  "[&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(6,182,212,0.5)]",
  "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white/80",
  "[&::-moz-range-thumb]:shadow-[0_0_14px_rgba(6,182,212,0.5)]",
  sliderThumbPaint,
].join(" ");

const rangeThumbClass =
  "pointer-events-none absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-[linear-gradient(135deg,var(--arena-blue),var(--electric-cyan))] shadow-[0_0_14px_rgba(6,182,212,0.5)]";

const toggleKnobClass = (active: boolean) =>
  cn(
    "absolute top-0.5 h-5 w-5 rounded-full border-2 transition-all duration-200",
    active
      ? "translate-x-6 border-white/90 bg-[linear-gradient(135deg,var(--electric-cyan),var(--aurora-purple))] shadow-[0_0_16px_rgba(139,92,246,0.45)]"
      : "translate-x-0.5 border-[var(--electric-cyan)]/50 bg-[linear-gradient(135deg,var(--arena-blue),var(--electric-cyan))] shadow-[0_0_12px_rgba(6,182,212,0.4)]",
  );

type DualRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  minValue: number | null;
  maxValue: number | null;
  onChange: (min: number | null, max: number | null) => void;
  formatValue?: (n: number) => string;
};

export function DualRangeSlider({
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
  formatValue = (n) => String(n),
}: DualRangeSliderProps) {
  const lo = minValue ?? min;
  const hi = maxValue ?? max;
  const span = max - min || 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
        <span>{formatValue(lo)}</span>
        <span className="text-[var(--text-secondary)]">to</span>
        <span>{formatValue(hi)}</span>
      </div>
      <div className="relative h-8">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[var(--arena-blue)] to-[var(--electric-cyan)]"
          style={{
            left: `${((lo - min) / span) * 100}%`,
            right: `${100 - ((hi - min) / span) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), hi);
            onChange(next <= min ? null : next, maxValue);
          }}
          className="pointer-events-auto absolute inset-0 z-10 w-full opacity-0"
          aria-label="Minimum value"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo);
            onChange(minValue, next >= max ? null : next);
          }}
          className="pointer-events-auto absolute inset-0 z-20 w-full opacity-0"
          aria-label="Maximum value"
        />
        <div
          className={rangeThumbClass}
          style={{ left: `${((lo - min) / span) * 100}%` }}
        />
        <div
          className={rangeThumbClass}
          style={{ left: `${((hi - min) / span) * 100}%` }}
        />
      </div>
    </div>
  );
}

type MinRangeSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number | null;
  onChange: (v: number | null) => void;
  formatValue?: (n: number) => string;
  anyLabel?: string;
};

export function MinRangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (n) => String(n),
  anyLabel = "Any",
}: MinRangeSliderProps) {
  const current = value ?? min;
  const active = value !== null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span
          className={cn(
            "text-xs font-bold",
            active ? "text-[var(--electric-cyan)]" : "text-[var(--text-secondary)]",
          )}
        >
          {active ? formatValue(current) : anyLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChange(next <= min ? null : next);
        }}
        className={trackClass}
        aria-label={label}
      />
    </div>
  );
}

type StepSliderProps<T extends string | number> = {
  label: string;
  options: { label: string; value: T | null }[];
  value: T | null;
  onChange: (v: T | null) => void;
  hideLabel?: boolean;
  blankDefault?: boolean;
  placeholder?: string;
};

export function StepSlider<T extends string | number>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
  blankDefault = false,
  placeholder = "Choose…",
}: StepSliderProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const current = options[index] ?? options[0];
  const isDefault = index === 0;
  const valueLabel =
    isDefault && blankDefault ? placeholder : (current?.label ?? "Any");

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2",
          hideLabel ? "justify-end" : "justify-between",
        )}
      >
        {!hideLabel ? (
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        ) : null}
        <span
          className={cn(
            "text-xs font-bold",
            isDefault
              ? "text-[var(--text-secondary)]"
              : "text-[var(--electric-cyan)]",
          )}
        >
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(0, options.length - 1)}
        step={1}
        value={index}
        onChange={(e) => {
          const next = options[Number(e.target.value)];
          if (next) onChange(next.value);
        }}
        className={trackClass}
        aria-label={label}
      />
      <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
        <span>{options[0]?.label}</span>
        <span>{options[options.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function SlideToggle({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={() => onChange(!active)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border transition-colors",
          active
            ? "border-[var(--electric-cyan)]/60 bg-[linear-gradient(90deg,rgba(37,99,235,0.35),rgba(6,182,212,0.35))]"
            : "border-[var(--electric-cyan)]/20 bg-[var(--electric-cyan)]/10",
        )}
      >
        <span className={toggleKnobClass(active)} />
      </button>
    </div>
  );
}

export function TriSlide({
  label,
  value,
  onChange,
  hideLabel = false,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  hideLabel?: boolean;
}) {
  const index = value === null ? 0 : value ? 1 : 2;
  const labels = ["Any", "Yes", "No"] as const;
  const isDefault = index === 0;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2",
          hideLabel ? "justify-end" : "justify-between",
        )}
      >
        {!hideLabel ? (
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        ) : null}
        <span
          className={cn(
            "text-xs font-bold",
            isDefault
              ? "text-[var(--text-secondary)]"
              : "text-[var(--electric-cyan)]",
          )}
        >
          {labels[index]}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={index}
        onChange={(e) => {
          const i = Number(e.target.value);
          onChange(i === 0 ? null : i === 1);
        }}
        className={trackClass}
        aria-label={label}
      />
      <div className="grid grid-cols-3 text-center text-[10px] text-[var(--text-secondary)]">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
