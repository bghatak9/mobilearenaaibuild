import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { absoluteUrl, localeAlternateLanguages } from "@/lib/seo";
import { compareDevices } from "@/lib/api";
import { UNIQUE_APP_LOCALES } from "@/i18n/locales";

import { CompareResultClient } from "./CompareResultClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await compareDevices(slug, locale);
  if (!result || result.devices.length < 2) {
    return { title: "Device Comparison Workspace" };
  }
  const names = result.devices.map((d) => d.name).join(" vs ");
  const description = `Arena comparison workspace: ${names}. Research specs, advantages, and decision matrix.`;
  const url = absoluteUrl(`/${locale}/compare/${slug}`);
  return {
    title: `${names} · Comparison Workspace`,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternateLanguages(`/compare/${slug}`, UNIQUE_APP_LOCALES),
    },
    openGraph: { type: "website", url, title: names, description },
    twitter: { card: "summary_large_image", title: names, description },
  };
}

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const result = await compareDevices(slug, locale);

  if (!result || result.devices.length < 2) {
    return (
      <ArenaShell>
        <SpectrumPanel className="mx-auto max-w-lg p-10 text-center">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Couldn&apos;t open this workspace
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Add at least two devices from the comparison hub.
          </p>
          <Link href="/compare" className="arena-btn-primary mt-6 inline-flex">
            Open comparison hub
          </Link>
        </SpectrumPanel>
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
          { label: "Compare", href: "/compare" },
          { label: devices.map((d) => d.name).join(" vs ") },
        ]}
      />
      <CompareResultClient devices={devices} winners={winners} slug={slug} />
    </ArenaShell>
  );
}
