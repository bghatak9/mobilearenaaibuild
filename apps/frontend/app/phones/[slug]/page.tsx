import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import SpecsTable from "@/components/phone/SpecsTable";
import CompareButton from "@/components/compare/CompareButton";
import { DeviceCommentsPanel } from "@/components/phone/DeviceCommentsPanel";
import { DevicePricingPanel } from "@/components/phone/DevicePricingPanel";
import { RecentDeviceTracker } from "@/components/phone/RecentDeviceTracker";
import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { absoluteUrl } from "@/lib/seo";
import { getDeviceBySlug, type Device } from "@/lib/api";

function deviceSummary(device: Device): string {
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const device = await getDeviceBySlug(slug);
    const description = deviceSummary(device);
    const image = device.images?.[0]?.url;
    const url = absoluteUrl(`/phones/${device.slug}`);
    return {
      title: device.name,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title: device.name,
        description,
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: device.name,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: "Phone not found" };
  }
}

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let device: Device;
  try {
    device = await getDeviceBySlug(slug);
  } catch {
    notFound();
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

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Phones", href: "/phones" },
          { label: device.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <SpectrumPanel className="p-4">
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[var(--arena-blue)]/10 to-[var(--aurora-purple)]/10">
            {gallery[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[0].url}
                alt={device.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <span className="text-[var(--text-secondary)]">No image</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.thumbnail ?? img.url}
                  alt={device.name}
                  className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                />
              ))}
            </div>
          )}
        </SpectrumPanel>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
            {device.brand?.name}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
            {device.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-2xl font-extrabold text-[var(--premium-gold)]">
              {device.price != null ? `$${device.price.toLocaleString()}` : "Price N/A"}
            </span>
            {device.rating != null && (
              <span className="inline-flex items-center gap-1 text-[var(--premium-gold)]">
                <Star size={18} className="fill-current" />
                <span className="font-semibold">{device.rating.toFixed(1)}</span>
              </span>
            )}
            <CompareButton
              device={{ id: device.id, slug: device.slug, name: device.name }}
            />
          </div>

          <SpectrumPanel className="mt-8 p-4 sm:p-6">
            <SpecsTable device={device} />
          </SpectrumPanel>

          {device.reviews && device.reviews.length > 0 && (
            <SpectrumPanel className="mt-8 p-4 sm:p-6">
              <h2 className="mb-3 text-xl font-bold text-[var(--text-primary)]">Reviews</h2>
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

          <DevicePricingPanel
            priceHistory={device.priceHistory}
            countryAvailability={device.countryAvailability}
            currentPrice={device.price}
          />

          <DeviceCommentsPanel deviceId={device.id} deviceName={device.name} />
        </div>
      </div>
    </ArenaShell>
  );
}
