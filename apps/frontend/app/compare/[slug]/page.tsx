import type { Metadata } from "next";
import Link from "next/link";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { ArenaCompareExperience } from "@/components/compare/ArenaCompareExperience";
import { CompareActions } from "@/components/compare/CompareActions";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { absoluteUrl } from "@/lib/seo";
import { compareDevices, type CompareResult } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await compareDevices(slug);
  if (!result || result.devices.length < 2) {
    return { title: "Comparison Tools" };
  }
  const names = result.devices.map((d) => d.name).join(" vs ");
  const description = `Visual Arena comparison: ${names}. Camera, display, performance, battery and community scores.`;
  const url = absoluteUrl(`/compare/${slug}`);
  return {
    title: names,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: names, description },
    twitter: { card: "summary_large_image", title: names, description },
  };
}

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await compareDevices(slug);

  if (!result || result.devices.length < 2) {
    return (
      <ArenaShell>
        <GlassPanel className="mx-auto max-w-lg p-10 text-center">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Couldn&apos;t build this comparison
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            One or more devices weren&apos;t found, or fewer than two were requested.
          </p>
          <Link href="/compare" className="arena-btn-primary mt-6 inline-flex">
            Back to comparison tools
          </Link>
        </GlassPanel>
      </ArenaShell>
    );
  }

  const { devices, winners } = result;

  return (
    <ArenaShell>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Comparison Tools", href: "/compare" },
          { label: devices.map((d) => d.name).join(" vs ") },
        ]}
      />

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
          Comparison Tools
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)] md:text-4xl">
          {devices.map((d) => d.name).join(" vs ")}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Visual scoring · AI summaries · Community verdicts
        </p>
        <CompareActions
          slug={slug}
          deviceSlugs={devices.map((d) => d.slug)}
          deviceNames={devices.map((d) => d.name)}
        />
        <Link
          href="/compare"
          className="mt-4 inline-block text-sm font-semibold text-[var(--electric-cyan)] hover:underline"
        >
          Edit selection
        </Link>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {devices.map((d) => (
          <GlassPanel key={d.id} className="p-4 text-center">
            {d.images?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={d.images[0].url}
                alt=""
                className="mx-auto h-28 object-contain"
              />
            ) : (
              <span className="text-4xl">📱</span>
            )}
            <Link
              href={`/phones/${d.slug}`}
              className="mt-3 block font-bold text-[var(--text-primary)] hover:text-[var(--electric-cyan)]"
            >
              {d.name}
            </Link>
            <p className="text-xs text-[var(--text-secondary)]">{d.brand?.name}</p>
          </GlassPanel>
        ))}
      </div>

      <ArenaCompareExperience
        devices={devices}
        winners={winners as CompareResult["winners"]}
      />
    </ArenaShell>
  );
}
