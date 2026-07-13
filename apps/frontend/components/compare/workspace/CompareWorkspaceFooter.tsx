"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import {
  BookmarkPlus,
  FileDown,
  Link2,
  Printer,
  Share2,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/design-system/buttons/Button";
import {
  downloadCsv,
  exportComparisonCsv,
  printComparison,
} from "@/features/comparison";
import { saveComparison } from "@/lib/api";
import { getToken } from "@/lib/api";
import type { Device } from "@/lib/api";

type Props = {
  devices: Device[];
  slug: string;
};

export function CompareWorkspaceFooter({ devices, slug }: Props) {
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/compare/${slug}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSaveMsg("Could not copy link");
    }
  }

  async function saveWorkspace() {
    if (!getToken()) {
      setSaveMsg("Sign in to save workspace");
      return;
    }
    try {
      await saveComparison({
        deviceSlugs: devices.map((d) => d.slug),
        name: devices.map((d) => d.name).join(" vs "),
      });
      setSaveMsg("Workspace saved");
    } catch {
      setSaveMsg("Save failed");
    }
  }

  return (
    <footer className="cmp-workspace-footer rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
        Workspace actions
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => void saveWorkspace()}>
          <BookmarkPlus size={16} /> Save workspace
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => printComparison()}
        >
          <Printer size={16} /> Print view
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            downloadCsv(`arena-${slug}.csv`, exportComparisonCsv(devices))
          }
        >
          <FileDown size={16} /> Generate report
        </Button>
        <Button type="button" variant="secondary" onClick={() => void copyLink()}>
          {copied ? <Share2 size={16} /> : <Link2 size={16} />}
          {copied ? "Copied" : "Share link"}
        </Button>
        <Link
          href="/compare/trending"
          className="arena-btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <TrendingUp size={16} /> Track prices
        </Link>
        <Link
          href="/profile/comparisons"
          className="arena-btn-secondary inline-flex items-center gap-2 text-sm"
        >
          Create collection
        </Link>
      </div>
      {saveMsg ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{saveMsg}</p>
      ) : null}
    </footer>
  );
}
