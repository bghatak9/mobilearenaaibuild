import { getTranslations } from "next-intl/server";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { MAX_COMPARE } from "@/lib/compare-context";

import { CompareSelectClient } from "./CompareSelectClient";

export default async function CompareSelectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <ArenaShell>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: tc("home"), href: "/" },
          { label: t("title"), href: "/compare" },
          { label: t("breadcrumbSelect") },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          {t("selectDevices")}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {t("selectDevicesBody", { max: MAX_COMPARE })}
        </p>
      </header>
      <CompareSelectClient />
    </ArenaShell>
  );
}
