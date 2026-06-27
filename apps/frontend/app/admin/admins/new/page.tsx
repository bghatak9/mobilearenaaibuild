"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { RoleGate } from "@/components/admin/RoleGate";
import { createUser } from "@/lib/api";

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
    setLoading(true);
    try {
      await createUser({
        email,
        password,
        name: name || undefined,
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
          Create a new ADMIN account for business content management.
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
            <span className="font-medium text-gray-700">Email</span>
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
            <span className="font-medium text-gray-700">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
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
