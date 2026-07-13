/**
 * Locale-aware number, currency, and measurement formatting (Phase 6).
 */

export type FormatLocaleOptions = {
  locale?: string;
  fallback?: string;
};

function resolveLocale(locale?: string): string {
  if (locale) return locale;
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  try {
    return Intl.NumberFormat().resolvedOptions().locale;
  } catch {
    return "en";
  }
}

/** Decimal / thousands separators per locale. */
export function formatNumber(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions & FormatLocaleOptions = {},
): string {
  const { locale, fallback = "—", ...intl } = options;
  if (value == null || Number.isNaN(value)) return fallback;
  return new Intl.NumberFormat(resolveLocale(locale), intl).format(value);
}

/** Currency display. Defaults to USD when currency omitted. */
export function formatCurrency(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions &
    FormatLocaleOptions & { currency?: string } = {},
): string {
  const { locale, fallback = "—", currency = "USD", ...intl } = options;
  if (value == null || Number.isNaN(value)) return fallback;
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: intl.maximumFractionDigits ?? 0,
    ...intl,
  }).format(value);
}

/** Compact currency for cards (e.g. $799). */
export function formatPriceCompact(
  value: number | null | undefined,
  locale?: string,
): string {
  return formatCurrency(value, { locale, maximumFractionDigits: 0 });
}

/** Prefer metric (mm, g, mAh) labels; imperial toggle can wrap later. */
export function formatMillimeters(
  value: number | null | undefined,
  locale?: string,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${formatNumber(value, { locale, maximumFractionDigits: 1 })} mm`;
}

export function formatGrams(
  value: number | null | undefined,
  locale?: string,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${formatNumber(value, { locale, maximumFractionDigits: 0 })} g`;
}

export function formatMah(
  value: number | null | undefined,
  locale?: string,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${formatNumber(value, { locale, maximumFractionDigits: 0 })} mAh`;
}
