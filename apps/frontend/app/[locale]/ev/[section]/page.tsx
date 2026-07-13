import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { EvSectionPage } from "@/components/ev/EvSectionPage";
import { ALL_EV_SECTIONS, evSectionBySlug } from "@/features/ev/sections";

type PageProps = {
  params: Promise<{ section: string }>;
};

export function generateStaticParams() {
  return ALL_EV_SECTIONS.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section: slug } = await params;
  const section = evSectionBySlug(slug);
  if (!section) return { title: "EV" };

  return {
    title: `${section.title} — EV`,
    description: section.blurb,
  };
}

export default async function EvSectionRoute({ params }: PageProps) {
  const { section: slug } = await params;
  const section = evSectionBySlug(slug);
  if (!section) notFound();

  return (
    <ArenaShell>
      <EvSectionPage section={section} />
    </ArenaShell>
  );
}
