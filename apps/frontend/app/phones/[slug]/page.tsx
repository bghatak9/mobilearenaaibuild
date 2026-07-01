import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SpecsTable from "@/components/phone/SpecsTable";
import CompareButton from "@/components/compare/CompareButton";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { getDeviceBySlug, type Device } from "@/lib/api";
import { Container } from "@mobilearena/ui";

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
    <div className="min-h-screen bg-bg-primary pb-24">
      <JsonLd data={jsonLd} />
      <Header />

      <section>
        <Container wide className="py-8">
          <nav className="mb-4 text-sm text-text-muted">
            <Link href="/" className="hover:text-blue transition">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/phones" className="hover:text-blue transition">
              Phones
            </Link>{" "}
            / <span className="text-text-secondary">{device.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <div>
              <div className="titan-card flex h-72 items-center justify-center overflow-hidden">
                {gallery[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gallery[0].url}
                    alt={device.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-text-muted">No image</span>
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
                      className="h-16 w-16 rounded-[var(--radius-image)] border border-border-soft object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="titan-display text-3xl">{device.name}</h1>
              <p className="mt-1 text-text-muted">{device.brand?.name}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="titan-mono text-2xl font-semibold text-green">
                  {device.price != null ? `$${device.price}` : "Price N/A"}
                </span>
                {device.rating != null && (
                  <span className="inline-flex items-center gap-1 text-orange">
                    <Star size={18} className="fill-orange stroke-orange" />
                    <span className="titan-mono font-medium">
                      {device.rating.toFixed(1)}
                    </span>
                  </span>
                )}
                <CompareButton
                  device={{ id: device.id, slug: device.slug, name: device.name }}
                />
              </div>

              <div className="mt-8">
                <SpecsTable device={device} />
              </div>

              {device.reviews && device.reviews.length > 0 && (
                <div className="mt-8">
                  <h2 className="titan-display mb-3 text-xl">Reviews</h2>
                  <ul className="space-y-2">
                    {device.reviews.map((r) => (
                      <li
                        key={r.id}
                        className="titan-card flex items-center justify-between px-4 py-3 hover:transform-none hover:shadow-card"
                      >
                        <span className="font-medium text-text-primary">
                          {r.title}
                        </span>
                        <span className="titan-mono text-sm text-orange">
                          {r.score.toFixed(1)}/10
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
