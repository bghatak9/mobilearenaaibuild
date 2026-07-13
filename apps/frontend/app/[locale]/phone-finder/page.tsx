import { Suspense } from "react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import PhoneFinderPageInner from "./PhoneFinderPageInner";

export default function PhoneFinderPage() {
  return (
    <ArenaShell>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-64 w-full rounded-[22px]" />
          </div>
        }
      >
        <PhoneFinderPageInner />
      </Suspense>
    </ArenaShell>
  );
}
