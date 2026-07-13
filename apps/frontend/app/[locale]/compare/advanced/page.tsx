import { ArenaShell } from "@/components/layout/ArenaShell";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { CompareWizard } from "@/components/compare/CompareWizard";
import { getDevices } from "@/lib/api";

export default async function CompareAdvancedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const devices = await getDevices(undefined, locale).catch(() => []);

  return (
    <ArenaShell>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Comparison Tools", href: "/compare" },
          { label: "Advanced" },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Advanced comparison
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          AI recommendation wizard and weighted score preview.
        </p>
      </header>
      <CompareWizard devices={devices} />
    </ArenaShell>
  );
}
