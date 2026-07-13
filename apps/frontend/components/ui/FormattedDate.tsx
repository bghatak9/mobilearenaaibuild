"use client";

import { useLocale } from "next-intl";

import {
  formatDate,
  formatDateLong,
  formatDateShort,
  formatDateTime,
  formatRelativeDate,
  toDateTimeIso,
  type DateInput,
} from "@/lib/format-datetime";

type Props = {
  value: DateInput;
  variant?: "date" | "long" | "short" | "datetime" | "relative";
  className?: string;
  fallback?: string;
};

export function FormattedDate({
  value,
  variant = "date",
  className,
  fallback,
}: Props) {
  const locale = useLocale();

  let text: string;
  switch (variant) {
    case "long":
      text = formatDateLong(value, fallback ?? "", locale);
      break;
    case "short":
      text = formatDateShort(value, fallback ?? "", locale);
      break;
    case "datetime":
      text = formatDateTime(value, fallback ?? "—", locale);
      break;
    case "relative":
      text = formatRelativeDate(value, fallback ?? "—", locale);
      break;
    default:
      text = formatDate(value, { fallback: fallback ?? "—", locale });
  }

  if (!text) return null;

  const iso = toDateTimeIso(value);
  return (
    <time className={className} dateTime={iso}>
      {text}
    </time>
  );
}
