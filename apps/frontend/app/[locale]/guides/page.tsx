import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { absoluteUrl, localeAlternateLanguages } from "@/lib/seo";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

type GuideCard = {
  slug: string;
  titleKey: "buyingGuide" | "compareGuide" | "cameraGuide";
  bodyKey: "buyingGuideBody" | "compareGuideBody" | "cameraGuideBody";
  href: string;
};

const GUIDES: GuideCard[] = [
  {
    slug: "how-to-buy",
    titleKey: "buyingGuide",
    bodyKey: "buyingGuideBody",
    href: "/phone-finder",
  },
  {
    slug: "how-to-compare",
    titleKey: "compareGuide",
    bodyKey: "compareGuideBody",
    href: "/compare",
  },
  {
    slug: "camera-basics",
    titleKey: "cameraGuide",
    bodyKey: "cameraGuideBody",
    href: "/phone-finder",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("guides.title"),
    description: t("guides.description"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/guides`),
      languages: localeAlternateLanguages("/guides", UNIQUE_APP_LOCALES),
    },
  };
}

export default async function GuidesPage() {
  const t = await getTranslations("common");
  const tg = await getTranslations("guides");

  return (
    <ArenaShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: t("home"), href: "/" },
            { label: tg("breadcrumb") },
          ]}
        />
        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {tg("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            {tg("subtitle")}
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {GUIDES.map((guide) => (
            <SpectrumPanel key={guide.slug} className="flex flex-col p-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {tg(guide.titleKey)}
              </h2>
              <p className="mt-2 flex-1 text-sm text-[var(--text-secondary)]">
                {tg(guide.bodyKey)}
              </p>
              <Link
                href={guide.href}
                className="mt-4 text-sm font-semibold text-[var(--electric-cyan)]"
              >
                {tg("readGuide")} →
              </Link>
            </SpectrumPanel>
          ))}
        </div>
      </div>
    </ArenaShell>
  );
}
