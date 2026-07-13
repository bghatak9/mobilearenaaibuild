"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/design-system/utils/cn";
import type { PhoneFinderPreset } from "@/features/phone-finder";

type Variant = "cyan" | "emerald";

export function PresetChipGrid({
  presets,
  activeId,
  onSelect,
  variant = "cyan",
}: {
  presets: PhoneFinderPreset[];
  activeId: string | null;
  onSelect: (id: string) => void;
  variant?: Variant;
}) {
  const t = useTranslations("finder");
  const activeClass =
    variant === "emerald"
      ? "border-[var(--emerald-success)]/50 bg-[var(--emerald-success)]/15 text-[var(--emerald-success)]"
      : "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/25 text-[var(--electric-cyan)]";

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {presets.map((p) => {
        const active = activeId === p.id;
        const label = t(p.labelKey as Parameters<typeof t>[0]);
        const description = t(p.descriptionKey as Parameters<typeof t>[0]);
        return (
          <button
            key={p.id}
            type="button"
            title={description}
            onClick={() => onSelect(p.id)}
            className={cn(
              "min-w-0 rounded-xl border px-3 py-2 text-left text-xs font-semibold leading-snug transition",
              active
                ? activeClass
                : "border-white/10 bg-white/5 text-[var(--text-primary)] hover:border-white/20",
            )}
          >
            <span className="mr-1">{p.emoji}</span>
            <span className="break-words">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
