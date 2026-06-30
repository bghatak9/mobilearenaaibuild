"use client";

import { Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { RoleGate } from "@/components/admin/RoleGate";
import { StaffPasswordSecurityTable } from "@/components/admin/StaffPasswordSecurityTable";
import { getAuthPolicy } from "@/lib/api";
import { GOOGLE_SIGNIN_ENABLED } from "@/lib/google-auth";
import {
  STAFF_PASSWORD_SECURITY,
} from "@/lib/staff-password-policy";
import type { UserRole } from "@/lib/roles";

export default function SystemSettingsPage() {
  const [policy, setPolicy] = useState<Awaited<
    ReturnType<typeof getAuthPolicy>
  > | null>(null);

  const staffRows =
    policy?.staffPasswordSecurity?.map((row) => ({
      role: row.role,
      passwordsStored: "bcrypt_hash_only" as const,
      adminCanViewPassword: false as const,
      requirements:
        policy.passwordRequirementText ??
        "At least 8 characters with uppercase, lowercase, number, and special character.",
    })) ?? STAFF_PASSWORD_SECURITY;

  useEffect(() => {
    getAuthPolicy()
      .then(setPolicy)
      .catch(() => setPolicy(null));
  }, []);

  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Environment configuration and security policies (platform owner only).
        </p>

        <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <Shield size={16} />
            Authentication
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
            <li>
              Password storage:{" "}
              <strong>{policy?.passwordsStored ?? "hash_only"}</strong> (
              {policy?.passwordHashAlgorithm ?? "bcrypt"}
              {policy?.bcryptRounds ? `, ${policy.bcryptRounds} rounds` : ""} —
              never plain text)
            </li>
            <li>
              Admin password visibility:{" "}
              <strong>
                {policy?.adminCanViewPasswords === false ||
                policy?.adminCanViewPasswords == null
                  ? "Disabled — hashes only, not readable"
                  : "Enabled"}
              </strong>
            </li>
            <li>
              Password reset:{" "}
              <strong>{policy?.passwordReset ?? "email_otp"}</strong>
            </li>
            <li>
              Google Sign-In:{" "}
              <strong>
                {policy?.googleSignInEnabled ?? GOOGLE_SIGNIN_ENABLED
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </li>
            <li>
              Public sign-in:{" "}
              <code className="rounded bg-emerald-100 px-1">/login</code>
            </li>
            <li>
              Staff sign-in:{" "}
              <code className="rounded bg-emerald-100 px-1">/admin/login</code>
            </li>
            <li>
              Self-service reset:{" "}
              <code className="rounded bg-emerald-100 px-1">
                {policy?.resetPath ?? "/forgot-password"}
              </code>
            </li>
            <li>
              Admin password reset: send email OTP from User Management
              (SUPER_ADMIN)
            </li>
          </ul>
        </section>

        <div className="mt-4">
          <StaffPasswordSecurityTable rows={staffRows} />
        </div>

        <ul className="mt-4 space-y-2 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <li>
            Database — <code className="text-xs">DATABASE_URL</code>
          </li>
          <li>
            Redis — <code className="text-xs">REDIS_URL</code>
          </li>
          <li>
            JWT — <code className="text-xs">JWT_SECRET</code>
          </li>
          <li>
            Google OAuth — <code className="text-xs">GOOGLE_CLIENT_ID</code> /
            frontend{" "}
            <code className="text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
          </li>
          <li>
            OTP dev expose — <code className="text-xs">OTP_DEV_EXPOSE</code>
          </li>
        </ul>
      </div>
    </RoleGate>
  );
}
