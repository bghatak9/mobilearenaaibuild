"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getSiteLanguages } from "@/features/i18n";

/**
 * Polite live region for soft locale switches + moves focus to main after navigate.
 * WCAG: status messages for language changes; focus re-orientation for AT.
 */
export function LanguageStatusAnnouncer() {
  const locale = useLocale();
  const t = useTranslations("a11y");
  const [message, setMessage] = useState("");
  const prevLocale = useRef(locale);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      prevLocale.current = locale;
      return;
    }
    if (prevLocale.current === locale) return;
    prevLocale.current = locale;

    const entry = getSiteLanguages().find((l) => l.code === locale);
    const name = entry?.nativeLabel ?? locale;
    setMessage(t("languageChanged", { language: name }));

    // Re-orient screen readers after soft navigation.
    const main = document.getElementById("main-content");
    if (main) {
      main.focus({ preventScroll: true });
    }

    const clear = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(clear);
  }, [locale, t]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
      {message}
    </div>
  );
}
