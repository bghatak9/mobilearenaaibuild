"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import { countryFlag, mergeCountryOptions } from "@/lib/countries";

type Option = { code: string; name: string };

export default function CountrySelector({
  value,
  onChange,
  options,
  label = "Country",
  className = "",
}: {
  value: string;
  onChange: (code: string) => void;
  options: Option[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const merged = useMemo(() => mergeCountryOptions(options), [options]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q),
    );
  }, [merged, search]);

  const selected = merged.find((o) => o.code === value) ?? merged[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-[200px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-zinc-800 hover:border-red-300"
      >
        <span className="flex items-center gap-2 truncate">
          <span>{countryFlag(selected.code)}</span>
          <span>{selected.name}</span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 mt-1 w-full min-w-[240px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries…"
                className="w-full text-sm outline-none"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {filtered.map((opt) => (
                <li key={opt.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-red-50 ${
                      opt.code === value ? "bg-red-50 font-medium text-red-700" : "text-zinc-700"
                    }`}
                  >
                    <span>{countryFlag(opt.code)}</span>
                    <span>{opt.name}</span>
                    {opt.code !== "ALL" && (
                      <span className="ml-auto text-xs text-gray-400">
                        {opt.code}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
