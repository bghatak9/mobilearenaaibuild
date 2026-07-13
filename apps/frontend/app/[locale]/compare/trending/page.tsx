import { Link } from "@/i18n/navigation";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";

import { CompareTrendingClient } from "./CompareTrendingClient";

export default function CompareTrendingPage() {
  return (
    <ArenaShell>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Comparison Tools", href: "/compare" },
          { label: "Trending" },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Trending comparisons
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Most compared device matchups in your Arena session.
        </p>
      </header>
      <CompareTrendingClient />
      <Link
        href="/compare"
        className="mt-8 inline-block text-sm font-semibold text-[var(--electric-cyan)]"
      >
        ← Back to comparison hub
      </Link>
    </ArenaShell>
  );
}
