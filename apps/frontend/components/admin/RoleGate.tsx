"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAdminAuth } from "@/lib/admin-auth";
import { getDefaultAdminPath } from "@/lib/admin-nav";
import type { UserRole } from "@/lib/roles";

export function RoleGate({
  allowed,
  children,
}: {
  allowed: UserRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, ready } = useAdminAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user || !allowed.includes(user.role)) {
      router.replace(user ? getDefaultAdminPath(user.role) : "/admin/login");
    }
  }, [ready, user, allowed, router]);

  if (!ready || !user || !allowed.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
