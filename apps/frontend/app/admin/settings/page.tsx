"use client";

import { RoleGate } from "@/components/admin/RoleGate";

export default function SystemSettingsPage() {
  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Environment configuration, SMTP, CDN and security policies (platform
          owner only).
        </p>
        <ul className="mt-6 space-y-2 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <li>Database connection — via <code className="text-xs">DATABASE_URL</code></li>
          <li>Redis cache — via <code className="text-xs">REDIS_URL</code></li>
          <li>JWT secret — via <code className="text-xs">JWT_SECRET</code></li>
          <li>Error tracking — via <code className="text-xs">SENTRY_DSN</code></li>
        </ul>
      </div>
    </RoleGate>
  );
}
