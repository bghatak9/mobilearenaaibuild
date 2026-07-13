"use client";

import { buildDecisionMatrix } from "@/features/comparison";
import type { Device } from "@/lib/api";

type Props = {
  devices: Device[];
};

export function CompareDecisionMatrix({ devices }: Props) {
  const rows = buildDecisionMatrix(devices);

  return (
    <section className="cmp-workspace-matrix rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-5 md:p-6">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--electric-cyan)]">
        Decision matrix
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Recommended for</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium text-[var(--text-secondary)]">
                  {row.label}
                </td>
                <td className="py-3 text-right font-bold text-[var(--text-primary)]">
                  <span className="mr-1" aria-hidden>
                    🏆
                  </span>
                  {row.winnerName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
