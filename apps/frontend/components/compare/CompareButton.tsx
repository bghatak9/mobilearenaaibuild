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
      title={disabled ? `You can compare up to 4 phones` : undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : disabled
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600"
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
