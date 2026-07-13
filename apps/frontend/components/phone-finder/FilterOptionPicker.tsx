"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type FilterOption<T extends string = string> = {
  label: string;
  value: T;
};

type FilterOptionPickerProps<T extends string> = {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
  /** Keep option labels in original language (brands, chipsets, etc.). */
  preserveLabels?: boolean;
};

function maybePreserve(label: string, value: string, preserve?: boolean): ReactNode {
  void value;
  if (!preserve) return label;
  return (
    <span className="arena-brand-name notranslate" translate="no">
      {label}
    </span>
  );
}

export function FilterOptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  preserveLabels = false,
}: FilterOptionPickerProps<T>) {
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {options.length} options
        </span>
      </div>
      <div className={cn("grid gap-2", gridClass)}>
        {options.map((opt, index) => {
          const active = value === opt.value;
          return (
            <button
              key={`${label}-${opt.value}-${index}`}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-xs font-semibold leading-snug transition break-words",
                active
                  ? "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/25 text-[var(--electric-cyan)]"
                  : "border-white/10 bg-white/5 text-[var(--text-secondary)] hover:border-white/20 hover:text-[var(--text-primary)]",
              )}
            >
              {maybePreserve(opt.label, opt.value, preserveLabels)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ChooseableFilterPickerProps<T extends string> = {
  label?: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  hideLabel?: boolean;
  /** When value is `All`, show placeholder text in the trigger instead of the option label. */
  blankDefault?: boolean;
  /** Keep brand / proper-noun option labels out of page translation. */
  preserveLabels?: boolean;
};

export function ChooseableFilterPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Choose…",
  searchPlaceholder = "Search…",
  hideLabel = false,
  blankDefault = false,
  preserveLabels = false,
}: ChooseableFilterPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const choiceCount = options.filter((opt) => opt.value !== "All").length;
  const showPlaceholder = blankDefault && value === "All";
  const triggerLabel = showPlaceholder
    ? placeholder
    : (selected?.label ?? placeholder);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(next: T) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative space-y-2">
      {!hideLabel && label ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
          <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
            {choiceCount} choices
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={label ?? placeholder}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition",
          open
            ? "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/15 text-[var(--electric-cyan)]"
            : "border-white/10 bg-white/5 hover:border-white/20",
          showPlaceholder && !open
            ? "font-normal text-[var(--text-secondary)]"
            : "font-semibold text-[var(--text-primary)]",
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-[var(--text-secondary)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[var(--dark-space)] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          {options.length > 5 && (
            <div className="border-b border-white/10 p-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--electric-cyan)]/40"
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                No matches
              </li>
            ) : (
              filtered.map((opt, index) => {
                const active = value === opt.value;
                return (
                  <li key={`${label}-${opt.value}-${index}`}>
                    <button
                      type="button"
                      onClick={() => pick(opt.value)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition",
                        active
                          ? "bg-[var(--arena-blue)]/25 text-[var(--electric-cyan)]"
                          : "text-[var(--text-primary)] hover:bg-white/5",
                      )}
                    >
                      {maybePreserve(opt.label, opt.value, preserveLabels)}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function toFilterOptions(items: string[], anyLabel = "Any") {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    if (seen.has(item)) return [];
    seen.add(item);
    return [{ label: item === "All" ? anyLabel : item, value: item }];
  });
}

export function toYearOptions(years: number[], anyLabel = "Any year") {
  return [
    { label: anyLabel, value: "any" },
    ...years.map((year) => ({ label: String(year), value: String(year) })),
  ];
}

const TRI_STATE_OPTIONS: FilterOption<string>[] = [
  { label: "Any", value: "any" },
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export function triStateValue(value: boolean | null): string {
  if (value === null) return "any";
  return value ? "yes" : "no";
}

export function triStateFromPicker(value: string): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

type ChooseableTriStatePickerProps = {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  placeholder?: string;
};

export function ChooseableTriStatePicker({
  label,
  value,
  onChange,
  placeholder = "Choose…",
}: ChooseableTriStatePickerProps) {
  return (
    <ChooseableFilterPicker
      label={label}
      options={TRI_STATE_OPTIONS}
      value={triStateValue(value)}
      onChange={(next) => onChange(triStateFromPicker(next))}
      placeholder={placeholder}
      searchPlaceholder="Search…"
    />
  );
}
