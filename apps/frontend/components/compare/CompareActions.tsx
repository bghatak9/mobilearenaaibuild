"use client";

import { useState } from "react";
import { Check, Link2, BookmarkPlus } from "lucide-react";

import { Button } from "@/design-system/buttons/Button";
import { saveComparison } from "@/lib/api";
import { getToken } from "@/lib/api";
import Link from "next/link";

export function CompareActions({
  slug,
  deviceSlugs,
  deviceNames,
}: {
  slug: string;
  deviceSlugs: string[];
  deviceNames: string[];
}) {
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function copyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/compare/${slug}`
        : `/compare/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSaveMsg("Could not copy link");
    }
  }

  async function handleSave() {
    if (!getToken()) {
      setSaveMsg("Sign in to save comparisons to your profile.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      await saveComparison({
        deviceSlugs,
        name: deviceNames.join(" vs "),
      });
      setSaveMsg("Saved to your profile.");
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" onClick={() => void copyLink()}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}
        {copied ? "Link copied" : "Share link"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={saving}
        onClick={() => void handleSave()}
      >
        <BookmarkPlus size={16} />
        {saving ? "Saving…" : "Save comparison"}
      </Button>
      {saveMsg && (
        <span className="text-sm text-[var(--text-secondary)]">
          {saveMsg}{" "}
          {saveMsg.includes("Sign in") && (
            <Link href="/login" className="text-[var(--electric-cyan)] underline">
              Sign in
            </Link>
          )}
        </span>
      )}
    </div>
  );
}
