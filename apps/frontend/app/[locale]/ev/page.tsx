import type { Metadata } from "next";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { EvPageInner } from "@/components/ev/EvPageInner";

export const metadata: Metadata = {
  title: "EV Arena — Electric Vehicles",
  description:
    "Explore electric cars, SUVs, trucks, vans, bikes, and scooters. EV news, reviews, comparisons, and upcoming launches.",
};

export default function EvPage() {
  return (
    <ArenaShell>
      <EvPageInner />
    </ArenaShell>
  );
}
