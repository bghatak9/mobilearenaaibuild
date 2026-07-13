"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import {
  Battery,
  Camera,
  Cpu,
  Download,
  LayoutGrid,
  Monitor,
  Network,
  Printer,
  Scale,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";

import { CompareSpecTable } from "@/components/compare/CompareSpecTable";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Button } from "@/design-system/buttons/Button";
import { cn } from "@/design-system/utils/cn";
import {
  buildAiInsights,
  buildLabAwards,
  communityWinnerPercentages,
  computeWeightedRankings,
  DEFAULT_COMPARE_WEIGHTS,
  downloadCsv,
  estimateOwnershipCost,
  exportComparisonCsv,
  priceTimeline,
  printComparison,
  type CompareHubTab,
  type CompareViewMode,
  type CompareWeights,
} from "@/features/comparison";
import type { CompareResult, Device } from "@/lib/api";

const TABS: { id: CompareHubTab; label: string; icon: typeof Scale }[] = [
  { id: "overview", label: "Side-by-side", icon: LayoutGrid },
  { id: "camera", label: "Camera Lab", icon: Camera },
  { id: "performance", label: "Performance", icon: Cpu },
  { id: "battery", label: "Battery", icon: Battery },
  { id: "display", label: "Display", icon: Monitor },
  { id: "network", label: "Connectivity", icon: Network },
  { id: "software", label: "Software", icon: Sparkles },
  { id: "repairability", label: "Repairability", icon: Wrench },
  { id: "value", label: "Price Intel", icon: Trophy },
  { id: "ownership", label: "Ownership", icon: Scale },
  { id: "community", label: "Community", icon: Trophy },
  { id: "export", label: "Export", icon: Download },
];

const VIEW_MODES: { id: CompareViewMode; label: string }[] = [
  { id: "side-by-side", label: "Full specs" },
  { id: "differences", label: "Differences only" },
  { id: "winner", label: "Winner mode" },
  { id: "compact", label: "Compact" },
  { id: "print", label: "Print layout" },
];

type Props = {
  devices: Device[];
  winners: CompareResult["winners"];
  slug: string;
  initialTab?: CompareHubTab;
};

function LabAwards({ lab, devices }: { lab: string; devices: Device[] }) {
  const awards = buildLabAwards(lab, devices);
  if (!awards.length) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {awards.map((award) => (
        <span
          key={award.id}
          className="rounded-full border border-[var(--premium-gold)]/30 bg-[var(--premium-gold)]/10 px-3 py-1 text-xs font-semibold text-[var(--premium-gold)]"
        >
          {award.emoji} {award.label}: {award.deviceName}
        </span>
      ))}
    </div>
  );
}

export function CompareResultExperience({
  devices,
  winners: _winners,
  slug,
  initialTab = "overview",
}: Props) {
  const [tab, setTab] = useState<CompareHubTab>(initialTab);
  const [viewMode, setViewMode] = useState<CompareViewMode>("side-by-side");
  const [weights, setWeights] = useState<CompareWeights>(DEFAULT_COMPARE_WEIGHTS);

  const ai = useMemo(() => buildAiInsights(devices), [devices]);
  const rankings = useMemo(
    () => computeWeightedRankings(devices, weights),
    [devices, weights],
  );

  const labForTab =
    tab === "overview" ||
    tab === "community" ||
    tab === "export" ||
    tab === "value" ||
    tab === "ownership"
      ? null
      : tab;

  const showSpecTable = !["value", "ownership", "community", "export"].includes(
    tab,
  );

  const effectiveViewMode =
    viewMode === "print" || tab === "export" ? "side-by-side" : viewMode;

  return (
    <div className={cn(viewMode === "print" && "arena-compare-print")}>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 print:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              tab === id
                ? "border-[var(--electric-cyan)]/50 bg-[var(--electric-cyan)]/15 text-[var(--electric-cyan)]"
                : "border-white/10 bg-white/5 text-[var(--text-secondary)] hover:border-white/20",
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mb-4 flex flex-wrap gap-2 print:hidden">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setViewMode(mode.id);
                if (mode.id === "print") printComparison();
              }}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                viewMode === mode.id
                  ? "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/20 text-[var(--electric-cyan)]"
                  : "border-white/10 text-[var(--text-secondary)]",
              )}
            >
              {mode.id === "print" ? (
                <span className="inline-flex items-center gap-1">
                  <Printer size={12} /> {mode.label}
                </span>
              ) : (
                mode.label
              )}
            </button>
          ))}
        </div>
      )}

      {showSpecTable && (
        <>
          {labForTab && <LabAwards lab={labForTab} devices={devices} />}
          <CompareSpecTable
            devices={devices}
            mode={effectiveViewMode}
            labFilter={tab === "overview" ? null : labForTab}
          />
        </>
      )}

      {tab === "overview" && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2 print:hidden">
          <SpectrumPanel className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--aurora-purple)]">
              AI Analysis Engine
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              <li>
                <strong className="text-[var(--text-primary)]">Best overall:</strong>{" "}
                {ai.bestOverall.name} — {ai.bestOverall.reason}
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Best value:</strong>{" "}
                {ai.bestValue.name} — {ai.bestValue.reason}
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Best camera:</strong>{" "}
                {ai.bestCamera.name}
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Best battery:</strong>{" "}
                {ai.bestBattery.name}
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Best gaming:</strong>{" "}
                {ai.bestGaming.name}
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Best software:</strong>{" "}
                {ai.bestSoftware.name}
              </li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[var(--electric-cyan)]">
              {ai.summary}
            </p>
          </SpectrumPanel>

          <SpectrumPanel className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
              Weighted Score Builder
            </h3>
            <div className="mt-4 space-y-4">
              {(
                Object.keys(weights) as (keyof CompareWeights)[]
              ).map((key) => (
                <label key={key} className="block text-sm">
                  <span className="mb-1 flex justify-between capitalize text-[var(--text-secondary)]">
                    <span>{key}</span>
                    <span>{weights[key]}%</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weights[key]}
                    onChange={(e) =>
                      setWeights((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </label>
              ))}
            </div>
            <ol className="mt-4 space-y-2">
              {rankings.map((r, i) => (
                <li
                  key={r.index}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"
                >
                  <span>
                    #{i + 1} {r.name}
                  </span>
                  <span className="font-bold text-[var(--electric-cyan)]">
                    {r.score}
                  </span>
                </li>
              ))}
            </ol>
          </SpectrumPanel>
        </div>
      )}

      {tab === "value" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {devices.map((d) => (
            <SpectrumPanel key={d.id} className="p-5">
              <h3 className="font-bold text-[var(--text-primary)]">{d.name}</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                {priceTimeline(d).map((point) => (
                  <li key={point.label} className="flex justify-between">
                    <span>{point.label}</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {point.price}
                    </span>
                  </li>
                ))}
              </ul>
            </SpectrumPanel>
          ))}
        </div>
      )}

      {tab === "ownership" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {devices.map((d) => {
            const cost = estimateOwnershipCost(d);
            return (
              <SpectrumPanel key={d.id} className="p-5">
                <h3 className="font-bold text-[var(--text-primary)]">{d.name}</h3>
                <table className="mt-3 w-full text-sm">
                  <tbody className="text-[var(--text-secondary)]">
                    <tr>
                      <td className="py-1">Insurance (yr)</td>
                      <td className="py-1 text-right">₹{cost.insurance.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Battery replacement</td>
                      <td className="py-1 text-right">₹{cost.battery.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Screen repair risk</td>
                      <td className="py-1 text-right">₹{cost.screen.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Accessories</td>
                      <td className="py-1 text-right">₹{cost.accessories.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-4 text-sm font-bold text-[var(--electric-cyan)]">
                  3-year ownership: ₹{cost.total3Year.toLocaleString("en-IN")}
                </p>
              </SpectrumPanel>
            );
          })}
        </div>
      )}

      {tab === "community" && (
        <SpectrumPanel className="mt-6 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
            Community Intelligence
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
            {devices.map((d, i) => (
              <li key={d.id}>
                {communityWinnerPercentages(
                  devices.map((x) => x.name),
                  i,
                )}
              </li>
            ))}
          </ul>
          <Link
            href="/compare/trending"
            className="mt-4 inline-block text-sm font-semibold text-[var(--electric-cyan)] hover:underline"
          >
            View trending comparisons →
          </Link>
        </SpectrumPanel>
      )}

      {tab === "export" && (
        <SpectrumPanel className="mt-6 p-6 print:hidden">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
            Professional Export Tools
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => printComparison()}
            >
              <Printer size={16} /> Print report
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  `compare-${slug}.csv`,
                  exportComparisonCsv(devices),
                )
              }
            >
              <Download size={16} /> Download CSV
            </Button>
            <Link
              href={`/compare/${slug}`}
              className="arena-btn-secondary inline-flex items-center gap-2 text-sm"
            >
              Share public URL
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            PDF export and embed widgets are planned — CSV and print layouts are
            available now.
          </p>
        </SpectrumPanel>
      )}

    </div>
  );
}
