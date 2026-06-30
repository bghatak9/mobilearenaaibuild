"use client";

import { RoleGate } from "@/components/admin/RoleGate";
import RevenueAnalyticsPanel from "@/components/admin/RevenueAnalyticsPanel";
import { REVENUE_ANALYTICS_ROLES } from "@/lib/content-permissions";

export default function AdminRevenueAnalyticsPage() {
  return (
    <RoleGate allowed={[...REVENUE_ANALYTICS_ROLES]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Revenue Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track ad revenue, affiliate earnings, sponsored content income, and campaign
          performance in one view.
        </p>
        <div className="mt-6">
          <RevenueAnalyticsPanel />
        </div>
      </div>
    </RoleGate>
  );
}
