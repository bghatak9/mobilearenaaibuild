"use client";

import type { DatePreset } from "@/lib/countries";

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

export default function DateRangeFilter({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
}: {
  preset: DatePreset;
  from: string;
  to: string;
  onPresetChange: (p: DatePreset) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        Date range
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPresetChange(id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              preset === id
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="text-sm text-gray-600">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm text-gray-600">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
        </div>
      )}
    </div>
  );
}
