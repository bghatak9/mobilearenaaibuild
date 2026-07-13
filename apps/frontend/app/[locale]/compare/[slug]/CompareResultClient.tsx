"use client";

import { CompareWorkspace } from "@/components/compare/workspace/CompareWorkspace";
import type { CompareResult } from "@/lib/api";

export function CompareResultClient({
  devices,
  winners,
  slug,
}: {
  devices: CompareResult["devices"];
  winners: CompareResult["winners"];
  slug: string;
  initialTab?: string | null;
}) {
  return <CompareWorkspace devices={devices} winners={winners} slug={slug} />;
}
