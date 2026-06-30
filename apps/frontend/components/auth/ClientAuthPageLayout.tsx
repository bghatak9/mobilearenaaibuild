"use client";

import { ClientArenaShell } from "@/components/layout/ClientArenaShell";

export function ClientAuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientArenaShell auth>
      <div id="fb-root" />
      <div className="arena-auth-shell py-3 sm:py-5">{children}</div>
    </ClientArenaShell>
  );
}
