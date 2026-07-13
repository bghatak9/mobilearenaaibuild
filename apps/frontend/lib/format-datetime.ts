export type DateInput = string | Date | number | null | undefined;

export type FormatDateOptions = Intl.DateTimeFormatOptions & {
  fallback?: string;
  locale?: string;
};

function parseDate(value: DateInput): Date | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveLocale(locale?: string): string | undefined {
  if (locale) return locale;
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
}

function toIso(value: DateInput): string | undefined {
  const date = parseDate(value);
  return date?.toISOString();
}

/** Locale-aware calendar date (omits year when same as current year). */
export function formatDate(
  value: DateInput,
  options: FormatDateOptions = {},
): string {
  const { fallback = "—", locale, ...intlOptions } = options;
  const date = parseDate(value);
  if (!date) return fallback;

  const now = new Date();
  const defaults: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  };

  return date.toLocaleDateString(resolveLocale(locale), {
    ...defaults,
    ...intlOptions,
  });
}

/** Locale-aware long date, e.g. 3 July 2026 / July 3, 2026. */
export function formatDateLong(
  value: DateInput,
  fallback = "",
  locale?: string,
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString(resolveLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Month and year only. */
export function formatMonthYear(
  value: DateInput,
  fallback = "",
  locale?: string,
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString(resolveLocale(locale), {
    month: "long",
    year: "numeric",
  });
}

/** Short month + day (charts, compact UI). */
export function formatDateShort(
  value: DateInput,
  fallback = "",
  locale?: string,
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString(resolveLocale(locale), {
    month: "short",
    day: "numeric",
  });
}

/** Locale-aware date and time. */
export function formatDateTime(
  value: DateInput,
  fallback = "—",
  locale?: string,
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  const now = new Date();
  return date.toLocaleString(resolveLocale(locale), {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative time for recent dates; falls back to locale date after ~7 days. */
export function formatRelativeDate(
  value: DateInput,
  fallback = "—",
  locale?: string,
): string {
  const date = parseDate(value);
  if (!date) return fallback;

  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHour = Math.round(diffMs / 3_600_000);
  const diffDay = Math.round(diffMs / 86_400_000);

  try {
    const rtf = new Intl.RelativeTimeFormat(resolveLocale(locale), {
      numeric: "auto",
    });
    if (Math.abs(diffMin) < 1) {
      return rtf.format(Math.round(diffMs / 1000), "second");
    }
    if (Math.abs(diffHour) < 1) {
      return rtf.format(diffMin, "minute");
    }
    if (Math.abs(diffDay) < 1) {
      return rtf.format(diffHour, "hour");
    }
    if (Math.abs(diffDay) < 7) {
      return rtf.format(diffDay, "day");
    }
  } catch {
    /* use absolute date */
  }

  return formatDate(date, { locale });
}

export { parseDate as parseDateValue, toIso as toDateTimeIso };
