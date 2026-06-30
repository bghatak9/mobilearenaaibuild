import type { Metadata } from "next";

import { ArenaShell } from "@/components/layout/ArenaShell";
import CommunityPageInner from "./CommunityPageInner";

export const metadata: Metadata = {
  title: "Community | MobileArena",
  description: "Polls, reviews, and discussions from the MobileArena community.",
};

export default function CommunityPage() {
  return (
    <ArenaShell>
      <CommunityPageInner />
    </ArenaShell>
  );
}
