import { ArenaShell } from "@/components/layout/ArenaShell";

import { ProfileLayoutInner } from "./ProfileLayoutInner";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArenaShell>
      <ProfileLayoutInner>{children}</ProfileLayoutInner>
    </ArenaShell>
  );
}
