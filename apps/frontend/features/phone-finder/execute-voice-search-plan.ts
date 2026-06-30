import type { Device } from "@/lib/api";

import type { VoiceSearchPlan } from "./voice-search";
import type { PhoneFinderFilters } from "./types";

export async function executeVoiceSearchPlan(
  plan: VoiceSearchPlan,
  handlers: {
    onSearch: (
      query: string,
      patch?: Partial<PhoneFinderFilters>,
    ) => void | Promise<void>;
    onNavigate: (path: string) => void;
    onCompare: (devices: Device[]) => void | Promise<void>;
  },
) {
  switch (plan.type) {
    case "navigate":
      handlers.onNavigate(plan.path);
      return;
    case "compare":
      await handlers.onCompare(plan.devices);
      return;
    case "search":
      await handlers.onSearch(plan.query, plan.patch);
      return;
  }
}
