import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { absoluteUrl } from "@/lib/seo";
import { compareDevices, type Device, type CompareResult } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await compareDevices(slug);
  if (!result || result.devices.length < 2) {
    return { title: "Compare phones" };
  }
  const names = result.devices.map((d) => d.name).join(" vs ");
  const description = `Side-by-side specs comparison: ${names}. Display, chipset, battery, cameras and more.`;
  const url = absoluteUrl(`/compare/${slug}`);
  return {
    title: names,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: names, description },
    twitter: { card: "summary_large_image", title: names, description },
  };
}

type RowDef = {
  label: string;
  winnerKey?: keyof CompareResult["winners"];
  value: (d: Device) => string | null;
};

function mainCamera(d: Device): number | null {
  return d.cameras?.length
    ? Math.max(...d.cameras.map((c) => c.megapixel))
    : null;
}

const ROWS: RowDef[] = [
  { label: "Brand", value: (d) => d.brand?.name ?? null },
  {
    label: "Price",
    winnerKey: "price",
    value: (d) => (d.price != null ? `$${d.price}` : null),
  },
  {
    label: "Rating",
    winnerKey: "rating",
    value: (d) => (d.rating != null ? `${d.rating.toFixed(1)}/10` : null),
  },
  { label: "Display", value: (d) => d.display?.type ?? null },
  {
    label: "Screen size",
    value: (d) => (d.display ? `${d.display.size}"` : null),
  },
  { label: "Resolution", value: (d) => d.display?.resolution ?? null },
  {
    label: "Refresh rate",
    winnerKey: "refreshRate",
    value: (d) => (d.display ? `${d.display.refreshRate} Hz` : null),
  },
  {
    label: "Brightness",
    winnerKey: "brightness",
    value: (d) => (d.display ? `${d.display.brightness} nits` : null),
  },
  { label: "Chipset", value: (d) => d.chipset?.cpu ?? null },
  { label: "GPU", value: (d) => d.chipset?.gpu ?? null },
  {
    label: "Benchmark",
    winnerKey: "benchmark",
    value: (d) =>
      d.chipset?.benchmark != null ? String(d.chipset.benchmark) : null,
  },
  {
    label: "Main camera",
    winnerKey: "mainCamera",
    value: (d) => {
      const mp = mainCamera(d);
      return mp != null ? `${mp} MP` : null;
    },
  },
  {
    label: "Battery",
    winnerKey: "batteryCapacity",
    value: (d) => (d.battery ? `${d.battery.capacity} mAh` : null),
  },
  { label: "Charging", value: (d) => d.battery?.charging ?? null },
  {
    label: "Weight",
    winnerKey: "weight",
    value: (d) => (d.weight != null ? `${d.weight} g` : null),
  },
  { label: "OS", value: (d) => d.os ?? null },
  {
    label: "5G",
    value: (d) => (d.fiveG == null ? null : d.fiveG ? "Yes" : "No"),
  },
  {
    label: "NFC",
    value: (d) => (d.nfc == null ? null : d.nfc ? "Yes" : "No"),
  },
];

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await compareDevices(slug);

  if (!result || result.devices.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Couldn&apos;t build this comparison
          </h1>
          <p className="mt-2 text-gray-500">
            One or more devices weren&apos;t found, or fewer than two were
            requested.
          </p>
          <Link
            href="/compare"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white"
          >
            Back to compare
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  const { devices, winners } = result;

  const isWinner = (key: RowDef["winnerKey"], index: number) =>
    key ? (winners[key] ?? []).includes(index) : false;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Comparing {devices.length} phones
          </h1>
          <Link href="/compare" className="text-sm text-indigo-600 hover:underline">
            Edit selection
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky left-0 z-10 bg-white p-4 text-left text-gray-500">
                  Specification
                </th>
                {devices.map((d) => (
                  <th key={d.id} className="p-4 text-left align-top">
                    <Link
                      href={`/phones/${d.slug}`}
                      className="block font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {d.name}
                    </Link>
                    <span className="text-xs font-normal text-gray-500">
                      {d.brand?.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const cells = devices.map((d) => row.value(d));
                if (cells.every((c) => c == null)) return null;
                return (
                  <tr key={row.label} className="border-b border-gray-100 last:border-0">
                    <td className="sticky left-0 z-10 bg-white p-4 font-medium text-gray-500">
                      {row.label}
                    </td>
                    {devices.map((d, i) => {
                      const win = isWinner(row.winnerKey, i);
                      return (
                        <td
                          key={d.id}
                          className={`p-4 ${
                            win
                              ? "bg-emerald-50 font-semibold text-emerald-700"
                              : "text-gray-900"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {cells[i] ?? "—"}
                            {win && <Trophy size={14} className="text-emerald-600" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </div>
  );
}
