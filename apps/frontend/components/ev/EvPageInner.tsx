"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, Car } from "lucide-react";

import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { EV_HUB_SECTIONS, EV_VEHICLE_SECTIONS } from "@/features/ev/sections";

export function EvPageInner() {
  return (
    <div className="ev-hub-page" data-titan-accent="green">
      <Breadcrumbs
        className="mb-6"
        items={[{ label: "Home", href: "/" }, { label: "EV" }]}
      />

      <section className="ev-panel">
        <p className="ev-panel-eyebrow">
          <Car size={14} className="ev-panel-eyebrow-icon" aria-hidden />
          EV
        </p>
        <p className="ev-panel-lead">
          All electric vehicles — cars, SUVs, trucks, vans, bikes, and scooters.
          This section covers EVs only, separate from phones and mobile devices.
        </p>

        <div className="ev-vehicle-grid" aria-label="EV vehicle segments">
          {EV_VEHICLE_SECTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.slug}
                href={`/ev/${item.slug}`}
                className="ev-vehicle-card"
              >
                <div className="ev-card-head">
                  <span className="ev-vehicle-icon">
                    <Icon size={18} aria-hidden />
                  </span>
                  <h3 className="ev-vehicle-title">{item.title}</h3>
                </div>
                <p className="ev-vehicle-desc">{item.description}</p>
              </Link>
            );
          })}
        </div>
        <div className="ev-hub-grid">
          {EV_HUB_SECTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.slug}
                href={`/ev/${item.slug}`}
                className="ev-hub-card"
              >
                <div className="ev-card-head">
                  <span className="ev-hub-icon">
                    <Icon size={18} aria-hidden />
                  </span>
                  <h3 className="ev-hub-title">{item.title}</h3>
                </div>
                <p className="ev-hub-desc">{item.description}</p>
                <span className="ev-hub-link">
                  Open {item.slug.replace("-", " ")}
                  <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="ev-footer-actions">
          <Link href="/ev/news" className="ev-footer-btn ev-footer-btn-primary">
            Browse EV news
          </Link>
          <Link href="/ev/upcoming" className="ev-footer-btn">
            Upcoming EVs
          </Link>
        </div>

      </section>
    </div>
  );
}
