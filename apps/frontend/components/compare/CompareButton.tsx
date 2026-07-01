"use client";

import { Check, Plus } from "lucide-react";
import { useCompare, type CompareItem } from "@/lib/compare-context";
import { CompareScaleIcon, cn } from "@mobilearena/ui";

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
      title={disabled ? `You can compare up to 4 phones` : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-button)] border px-3 py-1.5 text-sm font-medium transition",
        active
          ? "titan-btn-primary border-transparent text-white"
          : disabled
            ? "border-border-soft text-text-muted cursor-not-allowed"
            : "border-border-soft text-text-secondary hover:border-blue hover:text-blue",
        className,
      )}
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
      <CompareScaleIcon className="h-3.5 w-3.5 opacity-60" />
    </button>
  );
}
