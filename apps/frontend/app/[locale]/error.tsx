"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--rose-alert)]">
        500
      </p>
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">
        {t("serverTitle")}
      </h1>
      <p className="text-[var(--text-secondary)]">{t("serverBody")}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--electric-cyan)] px-5 py-2.5 text-sm font-semibold text-[var(--dark-space)]"
        >
          {t("serverRetry")}
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
        >
          {t("notFoundCta")}
        </Link>
      </div>
    </div>
  );
}
