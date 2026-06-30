"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/lib/admin-auth";
import { getDefaultAdminPath } from "@/lib/admin-nav";

export default function AdminHomeRedirect() {
  const router = useRouter();
  const { user, ready } = useAdminAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    router.replace(getDefaultAdminPath(user.role));
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400 dark:text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-gray-400 dark:text-zinc-500">
      Redirecting…
    </div>
  );
}
