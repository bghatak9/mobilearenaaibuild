"use client";

import { cn } from "@/design-system/utils/cn";
import { Badge } from "@/design-system/badges/Badge";
import type { FilterOption } from "@/components/phone-finder/FilterOptionPicker";
import type { TriState } from "@/features/phone-finder";

export function FilterListSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-white/5 py-4 last:border-0">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
        {badge ? <Badge variant="cyan">{badge}</Badge> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FilterListItem({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
      {children ? <div className="pl-0.5">{children}</div> : null}
    </div>
  );
}

export function FilterListNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[var(--text-secondary)]">{children}</p>
  );
}

export function FilterChoiceList<T extends string>({
  options,
  value,
  onChange,
  includeAll = true,
  allLabel = "All",
}: {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  includeAll?: boolean;
  allLabel?: string;
}) {
  const choices = options.filter((option) => option.value !== "All");

  return (
    <ul className="space-y-1" role="list">
      {includeAll ? (
        <li>
          <FilterChoiceRow
            label={allLabel}
            active={value === "All"}
            onClick={() => onChange("All" as T)}
          />
        </li>
      ) : null}
      {choices.map((option) => (
        <li key={option.value}>
          <FilterChoiceRow
            label={option.label}
            active={value === option.value}
            onClick={() => onChange(option.value)}
          />
        </li>
      ))}
    </ul>
  );
}

export function FilterChoiceRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-lg border px-3 py-2 text-left text-sm transition",
        active
          ? "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/20 font-semibold text-[var(--electric-cyan)]"
          : "border-transparent bg-white/[0.03] text-[var(--text-secondary)] hover:border-white/10 hover:bg-white/[0.06] hover:text-[var(--text-primary)]",
      )}
    >
      {label}
    </button>
  );
}

export function FilterTriStateList({
  value,
  onChange,
}: {
  value: TriState;
  onChange: (value: TriState) => void;
}) {
  return (
    <FilterChoiceList
      options={[
        { label: "Any", value: "any" },
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ]}
      value={value === null ? "any" : value ? "yes" : "no"}
      onChange={(next) => {
        if (next === "any") onChange(null);
        else if (next === "yes") onChange(true);
        else onChange(false);
      }}
      includeAll={false}
    />
  );
}

export function FilterPresetList({
  presets,
  activeId,
  onSelect,
}: {
  presets: { id: string; label: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-1" role="list">
      {presets.map((preset) => (
        <li key={preset.id}>
          <button
            type="button"
            onClick={() => onSelect(preset.id)}
            className={cn(
              "flex w-full items-center rounded-lg border px-3 py-2.5 text-left text-sm transition",
              activeId === preset.id
                ? "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/20 font-semibold text-[var(--electric-cyan)]"
                : "border-transparent bg-white/[0.03] text-[var(--text-primary)] hover:border-white/10 hover:bg-white/[0.06]",
            )}
          >
            🔥 {preset.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
