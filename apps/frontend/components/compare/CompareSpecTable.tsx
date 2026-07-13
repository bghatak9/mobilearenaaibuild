"use client";

import { Pin, PinOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useMemo, useState } from "react";

import {
  COMPARE_SPEC_ROWS,
  rowValuesEqual,
  rowWinnerIndices,
  type CompareSpecRow,
  type CompareViewMode,
} from "@/features/comparison";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";
import { displayBrandName } from "@/lib/brand-visuals";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DeviceName } from "@/components/brands/DeviceName";

type Props = {
  devices: Device[];
  mode: CompareViewMode;
  labFilter?: string | null;
};

function filterRows(
  rows: CompareSpecRow[],
  devices: Device[],
  mode: CompareViewMode,
  labFilter: string | null,
): CompareSpecRow[] {
  let list = rows;
  if (labFilter) {
    list = list.filter((row) => row.labs?.includes(labFilter as never));
  }
  if (mode === "compact") {
    list = list.filter((row) => row.compact);
  }
  if (mode === "differences") {
    list = list.filter((row) => !rowValuesEqual(row, devices));
  }
  if (mode === "winner") {
    list = list.filter((row) => rowWinnerIndices(row, devices).length === 1);
  }
  return list;
}

export function CompareSpecTable({ devices, mode, labFilter = null }: Props) {
  const t = useTranslations("specs");
  const isMobile = useIsMobile();
  const [pinned, setPinned] = useState<string[]>([]);
  const [collapseIdentical, setCollapseIdentical] = useState(true);

  const labelFor = (row: CompareSpecRow) => {
    try {
      return t(row.labelKey);
    } catch {
      return row.label;
    }
  };

  const categoryFor = (row: CompareSpecRow) => {
    try {
      return t(row.categoryKey);
    } catch {
      return row.category;
    }
  };

  const formatSpecCell = (row: CompareSpecRow, device: Device): string => {
    if (row.id === "brand" && device.brand?.name) {
      return displayBrandName(device.brand.name);
    }
    const raw = row.format(device);
    if (raw === "__yes__") return t("yes");
    if (raw === "__no__") return t("no");
    return raw;
  };

  const rows = useMemo(() => {
    let list = filterRows(COMPARE_SPEC_ROWS, devices, mode, labFilter);
    if (collapseIdentical && mode !== "differences") {
      list = list.filter((row) => !rowValuesEqual(row, devices));
    }
    const pinnedRows = list.filter((r) => pinned.includes(r.id));
    const otherRows = list.filter((r) => !pinned.includes(r.id));
    return [...pinnedRows, ...otherRows];
  }, [devices, mode, labFilter, pinned, collapseIdentical]);

  const categories = [...new Set(rows.map((r) => r.categoryKey))];

  if (isMobile) {
    return (
      <div className="space-y-4 lg:hidden">
        {devices.map((device, deviceIndex) => (
          <div
            key={device.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <h3 className="mb-3 font-bold text-[var(--electric-cyan)]">
              <DeviceName name={device.name} brand={device.brand?.name} />
            </h3>
            <dl className="space-y-2 text-sm">
              {rows.map((row) => (
                <div key={row.id} className="flex justify-between gap-3">
                  <dt className="text-[var(--text-secondary)]">{labelFor(row)}</dt>
                  <dd
                    className={cn(
                      "text-right font-medium",
                      rowWinnerIndices(row, devices).includes(deviceIndex)
                        ? "text-[var(--emerald-success)]"
                        : "text-[var(--text-primary)]",
                    )}
                  >
                    {formatSpecCell(row, device)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden lg:block">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <label className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={collapseIdentical}
            onChange={(e) => setCollapseIdentical(e.target.checked)}
            className="rounded"
          />
          {collapseIdentical ? t("ui.collapseIdentical") : t("ui.showIdentical")}
        </label>
      </div>

      <div className="arena-compare-table-wrap overflow-x-auto rounded-2xl border border-white/10">
        <table className="arena-compare-table w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="arena-compare-sticky-col sticky left-0 z-20 min-w-[11rem] bg-[var(--dark-space)] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t("ui.specification")}
              </th>
              {devices.map((d) => (
                <th
                  key={d.id}
                  className="min-w-[10rem] px-4 py-3 text-left font-bold text-[var(--text-primary)]"
                >
                  <DeviceName name={d.name} brand={d.brand?.name} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((categoryKey) => {
              const sample = rows.find((r) => r.categoryKey === categoryKey);
              const categoryLabel = sample ? categoryFor(sample) : categoryKey;
              return (
                <Fragment key={`cat-${categoryKey}`}>
                  <tr className="bg-white/[0.02]">
                    <td
                      colSpan={devices.length + 1}
                      className="arena-compare-sticky-col sticky left-0 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--electric-cyan)]"
                    >
                      {categoryLabel}
                    </td>
                  </tr>
                  {rows
                    .filter((r) => r.categoryKey === categoryKey)
                    .map((row) => {
                      const winners = rowWinnerIndices(row, devices);
                      return (
                        <tr
                          key={row.id}
                          className={cn(
                            "border-b border-white/5",
                            winners.length === 1 && "bg-[var(--emerald-success)]/5",
                          )}
                        >
                          <td className="arena-compare-sticky-col sticky left-0 z-10 bg-[var(--dark-space)] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setPinned((prev) =>
                                    prev.includes(row.id)
                                      ? prev.filter((id) => id !== row.id)
                                      : [...prev, row.id],
                                  )
                                }
                                className="text-[var(--text-secondary)] hover:text-[var(--electric-cyan)]"
                                aria-label={
                                  pinned.includes(row.id)
                                    ? t("ui.unpin")
                                    : t("ui.pin")
                                }
                              >
                                {pinned.includes(row.id) ? (
                                  <PinOff size={14} />
                                ) : (
                                  <Pin size={14} />
                                )}
                              </button>
                              <span className="font-medium text-[var(--text-secondary)]">
                                {labelFor(row)}
                              </span>
                            </div>
                          </td>
                          {devices.map((d, i) => (
                            <td
                              key={d.id}
                              className={cn(
                                "px-4 py-3",
                                winners.includes(i) &&
                                  "font-semibold text-[var(--emerald-success)]",
                              )}
                            >
                              {formatSpecCell(row, d)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
