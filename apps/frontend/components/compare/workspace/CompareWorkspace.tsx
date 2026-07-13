"use client";

import { useState } from "react";

import { CompareCommunityInsights } from "@/components/device-intelligence/CompareCommunityInsights";
import { CompareDecisionMatrix } from "@/components/compare/workspace/CompareDecisionMatrix";
import { CompareDeviceHeaderCards } from "@/components/compare/workspace/CompareDeviceHeaderCards";
import { CompareInsightStrip } from "@/components/compare/workspace/CompareInsightStrip";
import { CompareWorkspaceFooter } from "@/components/compare/workspace/CompareWorkspaceFooter";
import { CompareWorkspaceHeader } from "@/components/compare/workspace/CompareWorkspaceHeader";
import { CompareWorkspacePreferences } from "@/components/compare/workspace/CompareWorkspacePreferences";
import { CompareWorkspaceSpecLayout } from "@/components/compare/workspace/CompareWorkspaceSpecLayout";
import {
  DEFAULT_WORKSPACE_DISPLAY,
  type WorkspaceComparisonMode,
  type WorkspaceDisplayOptions,
  type WorkspaceInformationDensity,
} from "@/features/comparison";
import type { CompareResult, Device } from "@/lib/api";

type Props = {
  devices: Device[];
  winners: CompareResult["winners"];
  slug: string;
};

export function CompareWorkspace({ devices, slug }: Props) {
  const [mode, setMode] = useState<WorkspaceComparisonMode>("complete");
  const [density, setDensity] = useState<WorkspaceInformationDensity>("standard");
  const [display, setDisplay] = useState<WorkspaceDisplayOptions>(
    DEFAULT_WORKSPACE_DISPLAY,
  );
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="cmp-workspace space-y-6 print:space-y-4">
      <CompareWorkspaceHeader
        devices={devices}
        slug={slug}
        onSearchHighlight={setSearchQuery}
      />

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
        <CompareWorkspacePreferences
          mode={mode}
          density={density}
          display={display}
          onModeChange={setMode}
          onDensityChange={setDensity}
          onDisplayChange={setDisplay}
        />

        <div className="min-w-0 space-y-6">
          <CompareDeviceHeaderCards devices={devices} />
          <CompareWorkspaceSpecLayout
            devices={devices}
            mode={mode}
            density={density}
            display={display}
            searchQuery={searchQuery}
          />
          <CompareInsightStrip devices={devices} />
          <CompareCommunityInsights devices={devices} />
          <CompareDecisionMatrix devices={devices} />
        </div>
      </div>

      <CompareWorkspaceFooter devices={devices} slug={slug} />
    </div>
  );
}
