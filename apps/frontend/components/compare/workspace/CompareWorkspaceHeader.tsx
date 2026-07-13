"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, FileDown, Plus } from "lucide-react";

import { SearchBar } from "@/design-system/forms/SearchBar";
import { downloadCsv, exportComparisonCsv } from "@/features/comparison";
import type { Device } from "@/lib/api";

type Props = {
  devices: Device[];
  slug: string;
  onSearchHighlight?: (query: string) => void;
};

export function CompareWorkspaceHeader({
  devices,
  slug,
  onSearchHighlight,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <header className="cmp-workspace-header rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/80 p-5 md:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--electric-cyan)]">
        Arena Research
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-3xl">
        Device Comparison Workspace
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {devices.map((d) => d.name).join(" · ")}
      </p>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearchHighlight?.(e.target.value);
          }}
          onSubmit={(q) => onSearchHighlight?.(q)}
          placeholder="Search devices to compare…"
          className="flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push("/compare/select")}
            className="arena-btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add device
          </button>
          <Link
            href="/profile/comparisons"
            className="arena-btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <Bookmark size={16} /> Saved sessions
          </Link>
          <button
            type="button"
            onClick={() =>
              downloadCsv(`arena-compare-${slug}.csv`, exportComparisonCsv(devices))
            }
            className="arena-btn-primary inline-flex items-center gap-2 text-sm"
          >
            <FileDown size={16} /> Export report
          </button>
        </div>
      </div>
    </header>
  );
}
