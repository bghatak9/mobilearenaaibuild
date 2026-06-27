import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SpecsTable from "@/components/phone/SpecsTable";
import CompareButton from "@/components/compare/CompareButton";
import { getDeviceBySlug, type Device } from "@/lib/api";

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/phones" className="hover:underline">
            Phones
          </Link>{" "}
          / <span className="text-gray-700">{device.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Gallery + key info */}
          <div>
            <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {gallery[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[0].url}
                  alt={device.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-gray-400">No image</span>
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
                    className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{device.name}</h1>
            <p className="mt-1 text-gray-500">{device.brand?.name}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="text-2xl font-semibold text-emerald-600">
                {device.price != null ? `$${device.price}` : "Price N/A"}
              </span>
              {device.rating != null && (
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <Star size={18} className="fill-amber-400 stroke-amber-400" />
                  <span className="font-medium">{device.rating.toFixed(1)}</span>
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
                <h2 className="mb-3 text-xl font-bold text-gray-900">Reviews</h2>
                <ul className="space-y-2">
                  {device.reviews.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                    >
                      <span className="font-medium text-gray-800">
                        {r.title}
                      </span>
                      <span className="text-sm text-amber-500">
                        {r.score.toFixed(1)}/10
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
