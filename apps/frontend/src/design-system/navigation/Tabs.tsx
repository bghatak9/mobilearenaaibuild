"use client";

import { cn } from "@/design-system/utils/cn";

export type TabItem = {
  id: string;
  label: string;
  badge?: number;
};

type TabsProps = {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-full border border-[var(--border-subtle)] bg-white/5 p-1",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-150",
              selected
                ? "bg-[var(--ma-brand)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
