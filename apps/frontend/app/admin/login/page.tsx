"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import { Button, Card, Input, TitanLogo } from "@mobilearena/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token, user } = await adminLogin(email, password);
      signIn(access_token, user);
      router.replace("/admin");
    } catch {
      setError("Invalid email or password, or account lacks staff access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <Card className="w-full max-w-sm p-8 hover:transform-none hover:shadow-card">
        <div className="flex items-center gap-2 titan-display text-2xl">
          <TitanLogo className="h-8 w-8" />
          Mobile<span className="text-blue">Arena</span>
          <span className="ml-1 text-sm font-medium text-text-muted">admin</span>
        </div>
        <p className="mt-1 text-sm text-text-muted">Sign in to manage content.</p>

        {error && (
          <p className="mt-4 rounded-[var(--radius-button)] border border-danger/30 bg-surface-2 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mt-5 block text-sm font-medium text-text-secondary">
            Email
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="superadmin@mobilearena.com"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-text-secondary">
            Password
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="••••••••"
            />
          </label>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="mt-6 w-full"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
