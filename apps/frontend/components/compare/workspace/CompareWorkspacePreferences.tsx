"use client";

import type {
  WorkspaceComparisonMode,
  WorkspaceDisplayOptions,
  WorkspaceInformationDensity,
} from "@/features/comparison";
import { cn } from "@/design-system/utils/cn";

const MODES: { id: WorkspaceComparisonMode; label: string }[] = [
  { id: "complete", label: "Complete View" },
  { id: "differences", label: "Differences Focus" },
  { id: "technical", label: "Technical Analysis" },
  { id: "buyer", label: "Buyer Perspective" },
  { id: "compact", label: "Compact Summary" },
];

const DENSITIES: { id: WorkspaceInformationDensity; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "standard", label: "Standard" },
  { id: "detailed", label: "Detailed" },
  { id: "engineering", label: "Engineering" },
];

type Props = {
  mode: WorkspaceComparisonMode;
  density: WorkspaceInformationDensity;
  display: WorkspaceDisplayOptions;
  onModeChange: (mode: WorkspaceComparisonMode) => void;
  onDensityChange: (density: WorkspaceInformationDensity) => void;
  onDisplayChange: (display: WorkspaceDisplayOptions) => void;
};

export function CompareWorkspacePreferences({
  mode,
  density,
  display,
  onModeChange,
  onDensityChange,
  onDisplayChange,
}: Props) {
  return (
    <aside className="cmp-workspace-prefs rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
        Display preferences
      </h2>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--electric-cyan)]">
          Comparison mode
        </p>
        <div className="mt-2 space-y-1.5">
          {MODES.map((m) => (
            <label
              key={m.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                mode === m.id
                  ? "bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]"
                  : "text-[var(--text-secondary)] hover:bg-white/5",
              )}
            >
              <input
                type="radio"
                name="cmp-mode"
                checked={mode === m.id}
                onChange={() => onModeChange(m.id)}
                className="accent-[var(--electric-cyan)]"
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--electric-cyan)]">
          Information density
        </p>
        <div className="mt-2 space-y-1.5">
          {DENSITIES.map((d) => (
            <label
              key={d.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                density === d.id
                  ? "bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]"
                  : "text-[var(--text-secondary)] hover:bg-white/5",
              )}
            >
              <input
                type="radio"
                name="cmp-density"
                checked={density === d.id}
                onChange={() => onDensityChange(d.id)}
                className="accent-[var(--electric-cyan)]"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--electric-cyan)]">
          Display options
        </p>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          {(
            [
              ["highlightAdvantages", "Highlight advantages"],
              ["stickyHeaders", "Sticky headers"],
              ["syncScrolling", "Synchronize scrolling"],
              ["collapseEmptySections", "Collapse empty sections"],
              ["pinImportantSpecs", "Pin important specifications"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={display[key]}
                onChange={(e) =>
                  onDisplayChange({ ...display, [key]: e.target.checked })
                }
                className="rounded accent-[var(--electric-cyan)]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
