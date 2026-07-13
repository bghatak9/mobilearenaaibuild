"use client";

import { ClientArenaShell } from "@/components/layout/ClientArenaShell";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export default function NotificationsPage() {
  return (
    <ClientArenaShell>
      <div className="mx-auto max-w-3xl">
        <NotificationsView />
      </div>
    </ClientArenaShell>
  );
}
