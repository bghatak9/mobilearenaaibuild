"use client";

import { countryName } from "@/lib/countries";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";

type PricePoint = {
  price: number;
  currency: string;
  recordedAt: string;
};

type Availability = {
  countryCode: string;
  available: boolean;
  price?: number | null;
  currency?: string | null;
};

export function DevicePricingPanel({
  priceHistory,
  countryAvailability,
  currentPrice,
}: {
  priceHistory?: PricePoint[];
  countryAvailability?: Availability[];
  currentPrice?: number | null;
}) {
  const history = priceHistory ?? [];
  const availability = countryAvailability ?? [];

  if (history.length === 0 && availability.length === 0) return null;

  const maxPrice = Math.max(...history.map((p) => p.price), currentPrice ?? 0, 1);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {history.length > 0 && (
        <SpectrumPanel className="p-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Price history</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Recent MSRP trends (USD)
          </p>
          <div className="mt-6 flex h-32 items-end gap-2">
            {history.map((point) => {
              const h = Math.max(8, Math.round((point.price / maxPrice) * 100));
              return (
                <div key={point.recordedAt} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[var(--arena-blue)] to-[var(--electric-cyan)]"
                    style={{ height: `${h}%` }}
                    title={`$${point.price.toLocaleString()}`}
                  />
                  <span className="text-[9px] text-[var(--text-secondary)]">
                    {new Date(point.recordedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </SpectrumPanel>
      )}

      {availability.length > 0 && (
        <SpectrumPanel className="p-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Availability by country
          </h2>
          <ul className="mt-4 divide-y divide-white/5">
            {availability.map((row) => (
              <li
                key={row.countryCode}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-[var(--text-primary)]">
                  {countryName(row.countryCode) ?? row.countryCode}
                </span>
                <span
                  className={
                    row.available
                      ? "text-[var(--emerald-success)]"
                      : "text-[var(--text-secondary)]"
                  }
                >
                  {row.available
                    ? row.price != null
                      ? `${row.currency ?? ""} ${row.price.toLocaleString()}`.trim()
                      : "Available"
                    : "Not available"}
                </span>
              </li>
            ))}
          </ul>
        </SpectrumPanel>
      )}
    </div>
  );
}
