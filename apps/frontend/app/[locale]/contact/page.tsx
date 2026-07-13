import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ContactPageInner } from "@/components/contact/ContactPageInner";
import { ArenaShell } from "@/components/layout/ArenaShell";
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
    title: t("contact.title"),
    description: t("contact.description"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/contact`),
      languages: localeAlternateLanguages("/contact", UNIQUE_APP_LOCALES),
    },
  };
}

export default function ContactPage() {
  return (
    <ArenaShell showAds={false}>
      <ContactPageInner />
    </ArenaShell>
  );
}
