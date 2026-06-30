"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { NotificationsView } from "@/components/notifications/NotificationsView";
import { ProfileLoading } from "@/components/profile/ProfileShell";
import { useSiteAuth } from "@/lib/site-auth";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, ready } = useSiteAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/notifications")}`);
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <ArenaShell>
        <ProfileLoading />
      </ArenaShell>
    );
  }

  return (
    <ArenaShell>
      <div className="mx-auto max-w-3xl">
        <NotificationsView />
      </div>
    </ArenaShell>
  );
}
