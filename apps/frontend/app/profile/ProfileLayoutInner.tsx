"use client";

import type { ReactNode } from "react";

import { ProfileProvider } from "@/components/profile/ProfileProvider";
import { ProfileShell } from "@/components/profile/ProfileShell";

export function ProfileLayoutInner({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <ProfileShell>{children}</ProfileShell>
    </ProfileProvider>
  );
}
