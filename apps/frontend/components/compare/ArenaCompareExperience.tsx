"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import type { CompareResult, Device } from "@/lib/api";

type MetricDef = {
  key: keyof CompareResult["winners"];
  label: string;
  category: string;
  score: (d: Device) => number | null;
  format: (d: Device) => string;
  higherIsBetter?: boolean;
};

function mainCameraMp(d: Device): number | null {
  if (!d.cameras?.length) return null;
  return Math.max(...d.cameras.map((c) => c.megapixel));
}

const METRICS: MetricDef[] = [
  {
    key: "mainCamera",
    label: "Camera",
    category: "CAMERA PERFORMANCE",
    score: mainCameraMp,
    format: (d) => {
      const mp = mainCameraMp(d);
      return mp != null ? `${mp} MP` : "—";
    },
  },
  {
    key: "refreshRate",
    label: "Display refresh",
    category: "DISPLAY",
    score: (d) => d.display?.refreshRate ?? null,
    format: (d) => (d.display ? `${d.display.refreshRate} Hz` : "—"),
  },
  {
    key: "brightness",
    label: "Peak brightness",
    category: "DISPLAY",
    score: (d) => d.display?.brightness ?? null,
    format: (d) => (d.display ? `${d.display.brightness} nits` : "—"),
  },
  {
    key: "benchmark",
    label: "Benchmark",
    category: "PERFORMANCE",
    score: (d) => d.chipset?.benchmark ?? null,
    format: (d) =>
      d.chipset?.benchmark != null ? String(d.chipset.benchmark) : "—",
  },
  {
    key: "batteryCapacity",
    label: "Battery",
    category: "ENDURANCE",
    score: (d) => d.battery?.capacity ?? null,
    format: (d) => (d.battery ? `${d.battery.capacity} mAh` : "—"),
  },
  {
    key: "rating",
    label: "Community rating",
    category: "COMMUNITY",
    score: (d) => (d.rating != null ? d.rating * 10 : null),
    format: (d) => {
      const count = d.communityRatingCount ?? 0;
      const rating = d.rating != null ? `${d.rating.toFixed(1)}/10` : "—";
      return count > 0 ? `${rating} (${count} votes)` : rating;
    },
  },
];

function barScore(value: number | null, max: number): number {
  if (value == null || max <= 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
}

function verdict(
  devices: Device[],
  winners: number[],
  metric: MetricDef,
): string {
  if (winners.length === 0) return "No clear winner for this metric.";
  if (winners.length > 1) {
    const names = winners.map((i) => devices[i]?.name).filter(Boolean);
    return `It's a tie between ${names.join(" and ")}.`;
  }
  const name = devices[winners[0]]?.name ?? "This device";
  return `${name} wins for ${metric.label.toLowerCase()}.`;
}

type Props = {
  devices: Device[];
  winners: CompareResult["winners"];
};

export function ArenaCompareExperience({ devices, winners }: Props) {
  const categories = [...new Set(METRICS.map((m) => m.category))];
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c, true])),
  );

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const metrics = METRICS.filter((m) => m.category === category);
        const open = expanded[category] ?? true;

        return (
          <SpectrumPanel key={category} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [category]: !open }))
              }
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <h2 className="text-sm font-bold tracking-widest text-[var(--electric-cyan)]">
                {category}
              </h2>
              {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {open && (
              <div className="space-y-6 border-t border-white/5 px-6 py-6">
                {metrics.map((metric) => {
                  const values = devices.map((d) => metric.score(d));
                  if (values.every((v) => v == null)) return null;
                  const max = Math.max(...values.filter((v): v is number => v != null));
                  const winnerIndices = winners[metric.key] ?? [];

                  return (
                    <div key={metric.key}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        {metric.label}
                      </p>
                      <div className="space-y-3">
                        {devices.map((d, i) => {
                          const val = values[i];
                          const pct = barScore(val, max);
                          const win = winnerIndices.includes(i);
                          return (
                            <div key={d.id}>
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                                <span
                                  className={`font-medium ${win ? "text-[var(--emerald-success)]" : "text-[var(--text-primary)]"}`}
                                >
                                  {d.name}
                                  {win && (
                                    <Trophy
                                      size={14}
                                      className="ml-1 inline text-[var(--premium-gold)]"
                                    />
                                  )}
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                  {metric.format(d)}
                                </span>
                              </div>
                              <div className="arena-score-bar">
                                <div
                                  className="arena-score-fill"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-[var(--text-secondary)]">
                        <Trophy
                          size={16}
                          className="mt-0.5 shrink-0 text-[var(--premium-gold)]"
                        />
                        <span>
                          <strong className="text-[var(--text-primary)]">
                            Arena Verdict:
                          </strong>{" "}
                          {verdict(devices, winnerIndices, metric)}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </SpectrumPanel>
        );
      })}

      <SpectrumPanel className="p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--aurora-purple)]">
          AI Summary · Arena Labs
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          Based on specs and community signals,{" "}
          <strong className="text-[var(--text-primary)]">
            {devices[0]?.name}
          </strong>{" "}
          leads on display and camera metrics while{" "}
          <strong className="text-[var(--text-primary)]">
            {devices[devices.length - 1]?.name}
          </strong>{" "}
          offers competitive endurance. Expand sections above for detailed
          visual scores and share this comparison with your community.
        </p>
        <Link
          href="/profile/comparisons"
          className="arena-btn-secondary mt-4 inline-flex text-sm"
        >
          Save comparison to profile
        </Link>
      </SpectrumPanel>
    </div>
  );
}
