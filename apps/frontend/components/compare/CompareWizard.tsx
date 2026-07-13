"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/design-system/buttons/Button";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { DEFAULT_COMPARE_WEIGHTS, computeWeightedRankings } from "@/features/comparison";
import type { Device } from "@/lib/api";
import { useCompare } from "@/lib/compare-context";

type WizardAnswers = {
  budget: "low" | "mid" | "high";
  gaming: number;
  camera: number;
  battery: number;
  brands: string;
  updates: number;
  size: "compact" | "large" | "any";
};

const DEFAULT_ANSWERS: WizardAnswers = {
  budget: "mid",
  gaming: 50,
  camera: 50,
  battery: 50,
  brands: "",
  updates: 50,
  size: "any",
};

function scoreDevice(device: Device, answers: WizardAnswers): number {
  let score = 0;
  const price = device.price ?? 60000;
  if (answers.budget === "low" && price < 35000) score += 25;
  if (answers.budget === "mid" && price >= 35000 && price < 70000) score += 25;
  if (answers.budget === "high" && price >= 70000) score += 25;

  score += ((device.chipset?.benchmark ?? 0) / 2000000) * (answers.gaming / 100) * 30;
  score +=
    ((device.cameras?.[0]?.megapixel ?? 0) / 200) * (answers.camera / 100) * 25;
  score +=
    ((device.battery?.capacity ?? 0) / 6000) * (answers.battery / 100) * 25;
  score += (device.rating ?? 0) * (answers.updates / 100) * 2;

  if (
    answers.brands &&
    device.brand?.name.toLowerCase().includes(answers.brands.toLowerCase())
  ) {
    score += 15;
  }

  return Math.round(score);
}

export function CompareWizard({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const { compareHref } = useCompare();
  const [answers, setAnswers] = useState<WizardAnswers>(DEFAULT_ANSWERS);

  const ranked = useMemo(
    () =>
      [...devices]
        .map((d) => ({ device: d, score: scoreDevice(d, answers) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6),
    [devices, answers],
  );

  const weightedPreview = useMemo(
    () =>
      ranked.length >= 2
        ? computeWeightedRankings(
            ranked.slice(0, 3).map((r) => r.device),
            DEFAULT_COMPARE_WEIGHTS,
          )
        : [],
    [ranked],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SpectrumPanel className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          AI Recommendation Wizard
        </h2>

        <label className="block text-sm">
          <span className="text-[var(--text-secondary)]">Budget</span>
          <select
            value={answers.budget}
            onChange={(e) =>
              setAnswers((a) => ({
                ...a,
                budget: e.target.value as WizardAnswers["budget"],
              }))
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2"
          >
            <option value="low">Budget</option>
            <option value="mid">Mid-range</option>
            <option value="high">Flagship</option>
          </select>
        </label>

        {(
          [
            ["gaming", "Gaming priority"],
            ["camera", "Camera importance"],
            ["battery", "Battery expectations"],
            ["updates", "Update longevity"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="flex justify-between text-[var(--text-secondary)]">
              <span>{label}</span>
              <span>{answers[key]}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={answers[key]}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [key]: Number(e.target.value) }))
              }
              className="mt-1 w-full"
            />
          </label>
        ))}

        <label className="block text-sm">
          <span className="text-[var(--text-secondary)]">Preferred brand</span>
          <input
            value={answers.brands}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, brands: e.target.value }))
            }
            placeholder="Samsung, Apple, Xiaomi…"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[var(--text-secondary)]">Device size</span>
          <select
            value={answers.size}
            onChange={(e) =>
              setAnswers((a) => ({
                ...a,
                size: e.target.value as WizardAnswers["size"],
              }))
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2"
          >
            <option value="any">Any</option>
            <option value="compact">Compact</option>
            <option value="large">Large</option>
          </select>
        </label>
      </SpectrumPanel>

      <SpectrumPanel className="p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Personalized results
        </h2>
        <ol className="mt-4 space-y-2">
          {ranked.map((entry, i) => (
            <li
              key={entry.device.id}
              className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"
            >
              <span>
                #{i + 1} {entry.device.name}
              </span>
              <span className="font-bold text-[var(--electric-cyan)]">
                {entry.score}
              </span>
            </li>
          ))}
        </ol>

        {weightedPreview.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-[var(--text-secondary)]">
              Weighted preview (top 3)
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {weightedPreview.map((r) => (
                <li key={r.index}>
                  {r.name}: {r.score}/100
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          type="button"
          className="mt-6 w-full"
          disabled={!compareHref}
          onClick={() => compareHref && router.push(compareHref)}
        >
          Open full comparison
        </Button>
        {!compareHref && (
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Add at least 2 devices from the hub to open a side-by-side report.
          </p>
        )}
      </SpectrumPanel>
    </div>
  );
}
