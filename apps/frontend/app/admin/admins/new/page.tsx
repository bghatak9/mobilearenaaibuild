"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { RoleGate } from "@/components/admin/RoleGate";
import { PasswordRequirementHint } from "@/components/auth/PasswordRequirementHint";
import { createUser } from "@/lib/api";
import { passwordValidationMessage } from "@/lib/password-policy";

export default function AdminCreationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.trim()) {
      const passwordError = passwordValidationMessage(password.trim(), "ADMIN");
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }
    setLoading(true);
    try {
      await createUser({
        email,
        name: name || undefined,
        password: password.trim() || undefined,
        role: "ADMIN",
      });
      router.push("/admin/users");
    } catch {
      setError("Could not create admin account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Creation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create an ADMIN account. Set a password (stored as a hash only) or
          leave blank and send a password reset email after creation.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 max-w-lg rounded-xl border border-gray-200 bg-white p-6"
        >
          <label className="block text-sm">
            <span className="font-medium text-gray-700">
              Email <span className="text-red-600">*</span>
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-medium text-gray-700">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-medium text-gray-700">
              Password{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </span>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to require email OTP reset"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {password.trim() ? <PasswordRequirementHint /> : null}
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create ADMIN"}
          </button>
        </form>
      </div>
    </RoleGate>
  );
}
