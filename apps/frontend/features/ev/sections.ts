import type { LucideIcon } from "lucide-react";
import {
  Bike,
  CalendarClock,
  Car,
  CarFront,
  GitCompareArrows,
  Newspaper,
  Star,
  Truck,
} from "lucide-react";

export type EvSection = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  blurb: string;
};

export const EV_VEHICLE_SECTIONS: EvSection[] = [
  {
    slug: "cars",
    title: "Electric cars",
    description: "Sedans, hatchbacks, and compact EVs from every major brand.",
    icon: Car,
    blurb:
      "Browse sedans, hatchbacks, and city-friendly electric cars — range, charging, pricing, and launch timelines.",
  },
  {
    slug: "suvs",
    title: "Electric SUVs & crossovers",
    description: "Family-ready EVs with range, space, and fast-charging options.",
    icon: CarFront,
    blurb:
      "Crossovers and SUVs built for families — cargo space, AWD options, DC fast charging, and real-world range.",
  },
  {
    slug: "trucks",
    title: "Electric trucks",
    description: "Work-ready and adventure EVs with towing and payload specs.",
    icon: Truck,
    blurb:
      "Pickup trucks and work EVs with towing capacity, bed utility, fleet use cases, and off-road capability.",
  },
  {
    slug: "vans",
    title: "Electric vans",
    description: "Passenger and commercial vans going all-electric.",
    icon: Truck,
    blurb:
      "Passenger vans and commercial fleets — last-mile delivery, shuttle service, and high-volume cargo layouts.",
  },
  {
    slug: "bikes",
    title: "E-bikes & scooters",
    description: "Two-wheelers and micromobility going all-electric.",
    icon: Bike,
    blurb:
      "Electric motorcycles, scooters, and e-bikes for urban commuting and recreational riding.",
  },
];

export const EV_HUB_SECTIONS: EvSection[] = [
  {
    slug: "news",
    title: "EV news",
    description: "Launches, policy, charging networks, and market moves.",
    icon: Newspaper,
    blurb:
      "Breaking EV industry news — new models, battery tech, charging infrastructure, incentives, and regulation.",
  },
  {
    slug: "reviews",
    title: "EV reviews",
    description: "Real-world range, charging, and ownership experiences.",
    icon: Star,
    blurb:
      "Hands-on EV reviews covering range tests, charging curves, cabin tech, and total cost of ownership.",
  },
  {
    slug: "compare",
    title: "Compare EVs",
    description: "Range, battery, charging speed, and price side by side.",
    icon: GitCompareArrows,
    blurb:
      "Stack electric vehicles side by side — EPA/WLTP range, battery size, peak charging, price, and trim levels.",
  },
  {
    slug: "upcoming",
    title: "Upcoming EVs",
    description: "Concepts, spy shots, and models not yet on sale.",
    icon: CalendarClock,
    blurb:
      "Track announced and upcoming electric vehicles before they hit showrooms.",
  },
];

export const ALL_EV_SECTIONS: EvSection[] = [
  ...EV_VEHICLE_SECTIONS,
  ...EV_HUB_SECTIONS,
];

export function evSectionBySlug(slug: string): EvSection | undefined {
  return ALL_EV_SECTIONS.find((section) => section.slug === slug);
}
