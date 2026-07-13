import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { type EvSection } from "@/features/ev/sections";

type EvSectionPageProps = {
  section: EvSection;
};

export function EvSectionPage({ section }: EvSectionPageProps) {
  const Icon = section.icon;

  return (
    <div className="ev-hub-page" data-titan-accent="green">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "EV", href: "/ev" },
          { label: section.title },
        ]}
      />

      <header className="ev-section-hero">
        <div className="ev-section-hero-grid" aria-hidden />
        <div className="ev-section-hero-icon">
          <Icon size={26} aria-hidden />
        </div>
        <p className="ev-section-hero-eyebrow">EV · {section.title}</p>
        <h1 className="ev-section-hero-title">{section.title}</h1>
        <p className="ev-section-hero-lead">{section.blurb}</p>
      </header>

    </div>
  );
}
