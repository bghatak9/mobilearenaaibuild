"use client";

import { useMemo, useRef, useState } from "react";
import { Pin, PinOff } from "lucide-react";

import {
  resolveIntelligenceSections,
  type CompareDensityMode,
} from "@/features/device-intelligence";
import type {
  WorkspaceComparisonMode,
  WorkspaceDisplayOptions,
  WorkspaceInformationDensity,
} from "@/features/comparison";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";

const PINNED_DEFAULT = new Set([
  "bat.capacity",
  "bench.antutu",
  "cam.main-mp",
  "display.refresh",
  "general.launch-price",
]);

type Props = {
  devices: Device[];
  mode: WorkspaceComparisonMode;
  density: WorkspaceInformationDensity;
  display: WorkspaceDisplayOptions;
  searchQuery?: string;
};

export function CompareWorkspaceSpecLayout({
  devices,
  mode,
  density,
  display,
  searchQuery = "",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState<Set<string>>(
    () => (display.pinImportantSpecs ? new Set(PINNED_DEFAULT) : new Set()),
  );

  const sections = useMemo(() => {
    const resolved = resolveIntelligenceSections(devices, {
      density: density as CompareDensityMode,
      view: mode,
      searchQuery,
      collapseEmpty: display.collapseEmptySections,
      differencesOnly: mode === "differences",
    });

    return resolved.map((section) => {
      const pinnedFields = section.fields.filter((f) => pinned.has(f.id));
      const otherFields = section.fields.filter((f) => !pinned.has(f.id));
      return { ...section, fields: [...pinnedFields, ...otherFields] };
    });
  }, [
    devices,
    mode,
    density,
    display.collapseEmptySections,
    searchQuery,
    pinned,
  ]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "cmp-workspace-spec rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/40",
        display.syncScrolling && "cmp-workspace-spec--sync",
      )}
    >
      <div className="overflow-x-auto">
        {sections.map((section) => (
          <section key={section.id} className="cmp-workspace-section">
            <h3
              className={cn(
                "cmp-workspace-section-title border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--electric-cyan)]",
                display.stickyHeaders &&
                  "sticky top-0 z-20 bg-[var(--dark-space)]/95 backdrop-blur-sm",
              )}
            >
              {section.title}
            </h3>
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead
                className={cn(
                  display.stickyHeaders &&
                    "sticky top-10 z-10 bg-[var(--dark-space)]/90 backdrop-blur-sm",
                )}
              >
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="cmp-workspace-sticky-col w-[11rem] min-w-[11rem] px-4 py-2.5 font-semibold">
                    Attribute
                  </th>
                  {devices.map((d) => (
                    <th
                      key={d.id}
                      className="min-w-[9rem] px-4 py-2.5 font-semibold"
                    >
                      {d.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.fields.map((field) => {
                  const canPin = display.pinImportantSpecs;
                  return (
                    <tr
                      key={`${section.id}-${field.id}`}
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="cmp-workspace-sticky-col bg-[var(--dark-space)] px-4 py-3">
                        <div className="flex items-center gap-2">
                          {canPin ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPinned((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(field.id)) next.delete(field.id);
                                  else next.add(field.id);
                                  return next;
                                })
                              }
                              className="text-[var(--text-secondary)] hover:text-[var(--electric-cyan)]"
                              aria-label={pinned.has(field.id) ? "Unpin" : "Pin"}
                            >
                              {pinned.has(field.id) ? (
                                <PinOff size={13} />
                              ) : (
                                <Pin size={13} />
                              )}
                            </button>
                          ) : null}
                          <span className="font-medium text-[var(--text-secondary)]">
                            {field.label}
                          </span>
                        </div>
                      </td>
                      {field.values.map((value, i) => {
                        const win =
                          display.highlightAdvantages &&
                          field.winnerIndices.length === 1 &&
                          field.winnerIndices[0] === i;
                        const device = devices[i];
                        return (
                          <td
                            key={device.id}
                            className={cn(
                              "px-4 py-3 text-[var(--text-primary)]",
                              win && "font-semibold text-[var(--emerald-success)]",
                            )}
                          >
                            {value}
                            {win ? (
                              <span
                                className="ml-1 text-[10px] text-[var(--emerald-success)]"
                                aria-label="Advantage"
                              >
                                ▲
                              </span>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}
