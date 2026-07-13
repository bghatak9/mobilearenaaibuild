"use client";

import { useTranslations } from "next-intl";

/** First focusable control — jumps keyboard users past chrome to page content. */
export function SkipToContent() {
  const t = useTranslations("a11y");

  return (
    <a href="#main-content" className="arena-skip-link">
      {t("skipToContent")}
    </a>
  );
}
