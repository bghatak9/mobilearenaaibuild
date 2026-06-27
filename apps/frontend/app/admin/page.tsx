"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/lib/admin-auth";
import { getDefaultAdminPath } from "@/lib/admin-nav";

export default function AdminHomeRedirect() {
  const router = useRouter();
  const { user, ready } = useAdminAuth();

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(getDefaultAdminPath(user.role));
  }, [ready, user, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
      Redirecting…
    </div>
  );
}
