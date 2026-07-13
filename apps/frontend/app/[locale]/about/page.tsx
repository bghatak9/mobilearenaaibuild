import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { absoluteUrl, localeAlternateLanguages } from "@/lib/seo";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("about.title"),
    description: t("about.description"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/about`),
      languages: localeAlternateLanguages("/about", UNIQUE_APP_LOCALES),
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <LegalDocumentPage title={t("title")} subtitle={t("subtitle")}>
      <p>{t("intro")}</p>

      <h2>{t("whatWeBuild")}</h2>
      <ul>
        <li>{t("buildDiscovery")}</li>
        <li>{t("buildCompare")}</li>
        <li>{t("buildNews")}</li>
        <li>{t("buildCommunity")}</li>
      </ul>

      <h2>{t("howWeWork")}</h2>
      <p>{t("howBody")}</p>

      <h2>{t("getInTouch")}</h2>
      <p>
        {t("contactLead")}{" "}
        <Link href="/contact">{t("contactLink")}</Link> {t("contactTrail")}
      </p>
    </LegalDocumentPage>
  );
}
