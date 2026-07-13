"use client";

import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";

const ITEMS = [
  { user: "TechFan42", action: "rated Volt Stride Pro 9.2/10", time: "2m ago" },
  { user: "NimbusFan", action: "joined Volt Mobile community", time: "8m ago" },
  { user: "ArenaLegend", action: "earned Reviewer badge", time: "15m ago" },
  { user: "CompareKing", action: "compared 3 flagships", time: "22m ago" },
  { user: "PhotoPro", action: "voted in a device poll", time: "31m ago" },
  { user: "DealHunter", action: "saved a price alert", time: "40m ago" },
];

export function CommunityStreamSwipe() {
  return (
    <SwipePagedList
      items={ITEMS}
      getKey={(item) => `${item.user}-${item.time}`}
      pageSize={3}
      renderItem={(item, index) => (
        <div
          className={`flex items-center gap-4 px-5 py-4 transition hover:bg-[var(--electric-cyan)]/5 ${
            index > 0 ? "border-t border-[var(--border-muted)]" : ""
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-accent)] bg-gradient-to-br from-[var(--arena-blue)] to-[var(--aurora-purple)] text-xs font-bold text-white shadow-lg shadow-[var(--arena-blue)]/20">
            {item.user.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--text-primary)]">
              <strong className="text-[var(--electric-cyan)]">{item.user}</strong>{" "}
              {item.action}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{item.time}</p>
          </div>
        </div>
      )}
    />
  );
}

export function CommunityStreamPanel() {
  return (
    <SpectrumPanel variant="accent" className="overflow-hidden">
      <CommunityStreamSwipe />
    </SpectrumPanel>
  );
}
