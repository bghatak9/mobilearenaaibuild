"use client";

import { HomeArenaCardPanel } from "@/components/home/arena/HomeArenaCardPanel";
import type { Device } from "@/lib/api";

type EditorsChoiceScrollProps = {
  devices: Device[];
  emptyMessage?: string;
};

function editorsBadge(): string {
  return "Editor Choice";
}

function editorsChip(device: Device): string | undefined {
  return device.os ?? undefined;
}

export function EditorsChoiceScroll({
  devices,
  emptyMessage = "Editor picks appear as reviews are published.",
}: EditorsChoiceScrollProps) {
  return (
    <HomeArenaCardPanel
      devices={devices}
      emptyMessage={emptyMessage}
      regionLabel="Editor's choice devices. Six cards visible at a time. Scroll vertically for more."
      pageLabelPrefix="Editor's choice devices"
      getBadge={() => editorsBadge()}
      getChip={editorsChip}
    />
  );
}
