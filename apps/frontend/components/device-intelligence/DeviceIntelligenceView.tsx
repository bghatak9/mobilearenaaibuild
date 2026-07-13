"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, FlaskConical, Layers, Microscope } from "lucide-react";

import {
  resolveDeviceSections,
  type CompareDensityMode,
} from "@/features/device-intelligence";
import { accentForIntelligenceSection } from "@/features/device-intelligence/section-accents";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import { TechnicalText } from "@/components/i18n/TechnicalText";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";

type Props = {
  device: Device;
  density?: CompareDensityMode;
};

function looksLikeSlug(value: string, deviceSlug: string): boolean {
  const raw = value.trim();
  if (!raw) return true;
  if (raw === deviceSlug) return true;
  return /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(raw);
}

function SpecFieldValue({
  fieldId,
  value,
  device,
}: {
  fieldId: string;
  value: unknown;
  device: Device;
}) {
  if (fieldId === "general.brand" && value) {
    return <BrandName name={String(value)} />;
  }
  if (fieldId === "general.model") {
    const raw = value != null ? String(value) : "";
    const title =
      !raw || looksLikeSlug(raw, device.slug) ? device.name : raw;
    return <DeviceName name={title} brand={device.brand?.name} />;
  }
  if (value == null || value === "") return <>—</>;
  return <TechnicalText value={String(value)} />;
}

export function DeviceIntelligenceView({
  device,
  density: initialDensity = "standard",
}: Props) {
  const [density, setDensity] = useState<CompareDensityMode>(initialDensity);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sections = useMemo(
    () =>
      resolveDeviceSections(device, density, {
        hideUnspecified: density !== "engineering",
      }),
    [device, density],
  );

  const totalFields = sections.reduce((n, s) => n + s.fields.length, 0);

  function isOpen(sectionId: string) {
    return expanded[sectionId] !== false;
  }

  function toggleSection(sectionId: string) {
    setExpanded((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false,
    }));
  }

  if (!sections.length) {
    return (
      <div className="intel-lab-empty">
        <FlaskConical size={28} className="text-[var(--electric-cyan)]" aria-hidden />
        <p>Extended specifications are not available for this device yet.</p>
      </div>
    );
  }

  return (
    <div className="intel-lab">
      <header className="intel-lab__header">
        <div>
          <p className="intel-lab__eyebrow">
            <TechnicalText value="Device Intelligence" />
          </p>
          <h2 className="intel-lab__title">
            <TechnicalText value="Specification laboratory" />
          </h2>
          <p className="intel-lab__subtitle">
            <TechnicalText
              value={`${totalFields} verified data points across ${sections.length} labs${
                density !== "engineering" ? " · unspecified fields hidden" : ""
              }`}
            />
          </p>
        </div>
        <div className="intel-lab__modes" role="tablist" aria-label="Detail level">
          <button
            type="button"
            role="tab"
            aria-selected={density === "standard"}
            className={cn("intel-lab__mode", density === "standard" && "intel-lab__mode--active")}
            onClick={() => setDensity("standard")}
          >
            <Layers size={14} aria-hidden />
            <TechnicalText value="Standard" />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={density === "detailed"}
            className={cn("intel-lab__mode", density === "detailed" && "intel-lab__mode--active")}
            onClick={() => setDensity("detailed")}
          >
            <FlaskConical size={14} aria-hidden />
            <TechnicalText value="Detailed" />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={density === "engineering"}
            className={cn(
              "intel-lab__mode",
              density === "engineering" && "intel-lab__mode--active",
            )}
            onClick={() => setDensity("engineering")}
          >
            <Microscope size={14} aria-hidden />
            <TechnicalText value="Engineering" />
          </button>
        </div>
      </header>

      <nav className="intel-lab__nav" aria-label="Specification sections">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#lab-${section.id}`}
            className="intel-lab__nav-link"
              style={
              {
                "--lab-accent": `var(${accentForIntelligenceSection(section.id)})`,
              } as CSSProperties
            }
          >
            <TechnicalText value={section.title.replace(/ · .+$/, "")} />
            <span className="intel-lab__nav-count">{section.fields.length}</span>
          </a>
        ))}
      </nav>

      <div className="intel-lab__sections">
        {sections.map((section) => {
          const accent = accentForIntelligenceSection(section.id);
          const open = isOpen(section.id);
          return (
            <section
              key={section.id}
              id={`lab-${section.id}`}
              className="intel-lab__section"
              style={{ "--lab-accent": `var(${accent})` } as CSSProperties}
            >
              <button
                type="button"
                className="intel-lab__section-head"
                aria-expanded={open}
                onClick={() => toggleSection(section.id)}
              >
                <span className="intel-lab__section-title">
                  <TechnicalText value={section.title} />
                </span>
                <span className="intel-lab__section-badge">{section.fields.length}</span>
                <ChevronDown
                  size={18}
                  className={cn("intel-lab__chevron", open && "intel-lab__chevron--open")}
                  aria-hidden
                />
              </button>
              {open ? (
                <dl className="intel-lab__grid">
                  {section.fields.map((field) => (
                    <div key={field.id} className="intel-lab__row">
                      <dt className="intel-lab__label">
                        <TechnicalText value={field.label} />
                      </dt>
                      <dd className="intel-lab__value">
                        <SpecFieldValue
                          fieldId={field.id}
                          value={field.values[0]}
                          device={device}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
