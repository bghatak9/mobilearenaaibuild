import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { BrandName } from "@/components/brands/BrandName";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { getBrandsGrouped } from "@/lib/api";
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
    title: t("brands.title"),
    description: t("brands.description"),
    alternates: {
      canonical: absoluteUrl(`/${locale}/brands`),
      languages: localeAlternateLanguages("/brands", UNIQUE_APP_LOCALES),
    },
  };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("common");
  const groups = await getBrandsGrouped(locale).catch(() => []);

  return (
    <ArenaShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: t("home"), href: "/" },
            { label: t("brands") },
          ]}
        />
        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {t("brandsPage.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            {t("brandsPage.subtitle")}
          </p>
        </header>

        {groups.length === 0 ? (
          <p className="text-[var(--text-secondary)]">{t("brandsPage.empty")}</p>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.category.slug}>
                <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                  {group.category.name}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {group.brands.map((brand) => (
                    <Link key={brand.id} href={`/brands/${brand.slug}`}>
                      <SpectrumPanel className="flex h-full items-center gap-3 p-4 transition hover:border-[var(--electric-cyan)]/40">
                        {brand.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logo}
                            alt=""
                            className="h-10 w-10 rounded-lg object-contain"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-sm font-bold">
                            {brand.name.slice(0, 1)}
                          </span>
                        )}
                        <BrandName
                          name={brand.name}
                          className="font-semibold text-[var(--text-primary)]"
                        />
                      </SpectrumPanel>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </ArenaShell>
  );
}
