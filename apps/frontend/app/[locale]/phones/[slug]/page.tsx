import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { DeviceArenaBriefHero } from "@/components/device-brief/DeviceArenaBriefHero";
import { CommunityInsightsPanel } from "@/components/device-intelligence/CommunityInsightsPanel";
import { TechnicalText } from "@/components/i18n/TechnicalText";
import { PhoneDetailBreadcrumbs } from "@/components/phone/PhoneDetailBreadcrumbs";
import SpecsTable from "@/components/phone/SpecsTable";
import { DeviceCommentsPanel } from "@/components/phone/DeviceCommentsPanel";
import { DevicePricingPanel } from "@/components/phone/DevicePricingPanel";
import { RecentDeviceTracker } from "@/components/phone/RecentDeviceTracker";
import JsonLd from "@/components/seo/JsonLd";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { absoluteUrl, localeAlternateLanguages, openGraphAlternateLocales, openGraphLocale } from "@/lib/seo";
import { getDeviceBySlug, type Device } from "@/lib/api";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

function deviceSummary(device: Device): string {
  if (device.seoDescription) return device.seoDescription;
  if (device.description) {
    return device.description.replace(/\s+/g, " ").slice(0, 160).trim();
  }
  const parts = [
    device.display ? `${device.display.size}" ${device.display.type}` : null,
    device.chipset?.cpu,
    device.battery ? `${device.battery.capacity} mAh battery` : null,
  ].filter(Boolean);
  return parts.length
    ? `${device.name}: ${parts.join(", ")}. Full specs, price and reviews.`
    : `${device.name} — full specifications, price and reviews on MobileArena.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const device = await getDeviceBySlug(slug, locale);
    const description = deviceSummary(device);
    const title = device.seoTitle ?? device.name;
    const image = device.images?.[0]?.url;
    const url = absoluteUrl(`/${locale}/phones/${device.slug}`);
    return {
      title,
      description,
      keywords: device.keywords ?? undefined,
      alternates: {
        canonical: url,
        languages: localeAlternateLanguages(
          `/phones/${device.slug}`,
          UNIQUE_APP_LOCALES,
          device.localeSlugs,
        ),
      },
      openGraph: {
        type: "website",
        url,
        title,
        description,
        locale: openGraphLocale(locale),
        alternateLocale: openGraphAlternateLocales(locale, UNIQUE_APP_LOCALES),
        ...(image ? { images: [{ url: image, alt: title }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    const t = await getTranslations({ locale, namespace: "errors" });
    return { title: t("phoneNotFound") };
  }
}

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let device: Device;
  try {
    device = await getDeviceBySlug(slug, locale);
  } catch (error) {
    // Only treat missing devices as 404 — backend downtime should not look like "page not found".
    const message = error instanceof Error ? error.message : String(error);
    if (/device not found/i.test(message)) {
      notFound();
    }
    throw error;
  }

  // Prefer locale-specific slug when available; keep EN as fallback entry that redirects.
  const preferredSlug =
    device.localeSlugs?.[locale] ??
    device.localeSlugs?.[locale.split("-")[0] ?? ""] ??
    device.slug;
  if (preferredSlug && preferredSlug !== slug) {
    permanentRedirect(`/${locale}/phones/${encodeURIComponent(preferredSlug)}`);
  }

  const gallery = device.images ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: device.name,
    description: deviceSummary(device),
    ...(device.brand?.name ? { brand: { "@type": "Brand", name: device.brand.name } } : {}),
    ...(gallery[0]?.url ? { image: gallery.map((g) => g.url) } : {}),
    ...(device.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: device.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(device.rating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: device.rating,
            bestRating: 10,
            ratingCount: Math.max(device.reviews?.length ?? 1, 1),
          },
        }
      : {}),
  };

  return (
    <ArenaShell>
      <JsonLd data={jsonLd} />
      <RecentDeviceTracker slug={device.slug} name={device.name} />

      <PhoneDetailBreadcrumbs
        className="mb-6"
        deviceName={device.name}
        brandName={device.brand?.name}
      />

      <div className="min-w-0">
          <h1 className="sr-only">
            {device.name}
          </h1>
          <DeviceArenaBriefHero device={device} />

          {device.description ? (
            <p className="mt-6 max-w-3xl text-[var(--text-secondary)]">
              {device.description}
            </p>
          ) : null}

          <div id="intelligence" className="mt-8 scroll-mt-28">
            <SpecsTable device={device} />
          </div>

          <div id="community" className="mt-8 scroll-mt-28">
            <Suspense fallback={null}>
              <CommunityInsightsPanel
                device={device}
                discussionBasePath={`/phones/${device.slug}`}
              />
            </Suspense>
          </div>

          {device.reviews && device.reviews.length > 0 && (
            <SpectrumPanel className="mt-8 p-4 sm:p-6">
              <h2 className="mb-3 text-xl font-bold text-[var(--text-primary)]">
                <TechnicalText value="Reviews" />
              </h2>
              <ul className="space-y-2">
                {device.reviews.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 sm:px-4"
                  >
                    <Link
                      href={`/reviews/${r.slug}`}
                      className="min-w-0 flex-1 break-words font-medium text-[var(--text-primary)] hover:text-[var(--electric-cyan)]"
                    >
                      {r.title}
                    </Link>
                    <span className="shrink-0 text-sm text-[var(--premium-gold)]">
                      {r.score.toFixed(1)}/10
                    </span>
                  </li>
                ))}
              </ul>
            </SpectrumPanel>
          )}

          <div id="pricing">
            <DevicePricingPanel
              priceHistory={device.priceHistory}
              countryAvailability={device.countryAvailability}
              currentPrice={device.price}
            />
          </div>

          <Suspense fallback={null}>
            <DeviceCommentsPanel
              deviceId={device.id}
              deviceName={device.name}
              deviceBrand={device.brand?.name}
            />
          </Suspense>
      </div>
    </ArenaShell>
  );
}
