import Link from "next/link";
import type { ReactNode } from "react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";

export function LegalDocumentPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <ArenaShell>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <GlassPanel className="prose prose-invert mx-auto max-w-3xl p-8 prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)]">
        <p className="not-prose text-sm">
          <Link href="/signup" className="font-medium text-[var(--electric-cyan)] hover:underline">
            ← Back to sign up
          </Link>
        </p>
        <h1 className="not-prose mt-4 text-3xl font-extrabold text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="not-prose mt-2 text-base text-[var(--text-secondary)]">{subtitle}</p>
        ) : null}
        {children}
      </GlassPanel>
    </ArenaShell>
  );
}
