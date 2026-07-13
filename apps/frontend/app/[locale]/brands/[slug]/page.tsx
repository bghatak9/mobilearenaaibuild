import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { getBrandBySlug } from "@/lib/api";
import {
  absoluteUrl,
  localeAlternateLanguages,
  openGraphAlternateLocales,
  openGraphLocale,
} from "@/lib/seo";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const brand = await getBrandBySlug(slug, locale);
    const title = brand.name;
    const description = `${brand.name} phones on MobileArena`;
    const url = absoluteUrl(`/${locale}/brands/${brand.slug}`);
    return {
      title,
      description,
      alternates: {
        canonical: url,
        languages: localeAlternateLanguages(
          `/brands/${brand.slug}`,
          UNIQUE_APP_LOCALES,
          brand.localeSlugs,
        ),
      },
      openGraph: {
        type: "website",
        url,
        title,
        description,
        locale: openGraphLocale(locale),
        alternateLocale: openGraphAlternateLocales(locale, UNIQUE_APP_LOCALES),
      },
    };
  } catch {
    const t = await getTranslations({ locale, namespace: "errors" });
    return { title: t("generic") };
  }
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("common");

  let brand;
  try {
    brand = await getBrandBySlug(slug, locale);
  } catch {
    notFound();
  }

  return (
    <ArenaShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: t("home"), href: "/" },
            { label: t("brands"), href: "/brands" },
            { label: brand.name },
          ]}
        />
        <header className="mt-6 mb-8 flex items-center gap-4">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt=""
              className="h-14 w-14 rounded-xl object-contain"
            />
          ) : null}
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              <BrandName name={brand.name} />
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("brandsPage.deviceCount", { count: brand.devices.length })}
            </p>
          </div>
        </header>

        {brand.devices.length === 0 ? (
          <p className="text-[var(--text-secondary)]">{t("brandsPage.noDevices")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brand.devices.map((device) => (
              <Link key={device.id} href={`/phones/${device.slug}`}>
                <SpectrumPanel className="overflow-hidden p-0 transition hover:border-[var(--electric-cyan)]/40">
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[var(--arena-blue)]/10 to-[var(--aurora-purple)]/10">
                    {device.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={device.images[0].url}
                        alt=""
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <span className="text-sm text-[var(--text-secondary)]">
                        MobileArena
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <DeviceName
                      name={device.name}
                      className="font-semibold text-[var(--text-primary)]"
                    />
                  </div>
                </SpectrumPanel>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ArenaShell>
  );
}
