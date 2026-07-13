import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ArenaShell } from "@/components/layout/ArenaShell";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <ArenaShell>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--electric-cyan)]">
          404
        </p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {t("notFoundTitle")}
        </h1>
        <p className="text-[var(--text-secondary)]">{t("notFoundBody")}</p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-[var(--electric-cyan)] px-5 py-2.5 text-sm font-semibold text-[var(--dark-space)]"
        >
          {t("notFoundCta")}
        </Link>
      </div>
    </ArenaShell>
  );
}
