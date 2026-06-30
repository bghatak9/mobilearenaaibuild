import { Suspense } from "react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import PhonesPageInner from "./PhonesPageInner";

export default function PhonesPage() {
  return (
    <ArenaShell>
      <Suspense
        fallback={
          <div className="p-8">
            <Skeleton className="h-10 w-48" />
          </div>
        }
      >
        <PhonesPageInner />
      </Suspense>
    </ArenaShell>
  );
}
