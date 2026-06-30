"use client";

import { Check, Plus, Scale } from "lucide-react";
import { useCompare, type CompareItem } from "@/lib/compare-context";

export default function CompareButton({
  device,
  className = "",
}: {
  device: CompareItem;
  className?: string;
}) {
  const { has, toggle, isFull } = useCompare();
  const active = has(device.slug);
  const disabled = !active && isFull;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(device);
      }}
      disabled={disabled}
      title={disabled ? "You can compare up to 4 phones" : undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition duration-150 ${
        active
          ? "border-[var(--electric-cyan)] bg-[var(--electric-cyan)]/20 text-[var(--electric-cyan)]"
          : disabled
            ? "cursor-not-allowed border-white/5 text-[var(--text-secondary)] opacity-50"
            : "border-white/15 text-[var(--text-primary)] hover:border-[var(--electric-cyan)]/50 hover:text-[var(--electric-cyan)]"
      } ${className}`}
    >
      {active ? (
        <>
          <Check size={15} /> In compare
        </>
      ) : (
        <>
          <Plus size={15} /> Compare
        </>
      )}
      <Scale size={14} className="opacity-60" />
    </button>
  );
}
