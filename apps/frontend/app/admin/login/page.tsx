"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useSocialAuthAvailable } from "@/components/auth/SocialAuthBlock";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { adminGoogleSignIn, adminLogin } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { available: socialAvailable, loading: socialLoading } =
    useSocialAuthAvailable();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token, user } = await adminLogin(identifier, password);
      signIn(access_token, user);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid credentials or not staff.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(idToken: string) {
    setError(null);
    setLoading(true);
    try {
      const { access_token, user } = await adminGoogleSignIn(idToken);
      signIn(access_token, user);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle
          variant="admin"
          showLabel
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 shadow-lg"
        />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Staff portal
          </p>
          <p className="text-sm font-medium text-zinc-400">Sign in to continue</p>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Staff sign in — SUPER ADMIN, ADMIN, EDITOR, AUTHOR, or MODERATOR.
          Passwords are bcrypt-hashed; administrators cannot view them.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-950/40 px-3 py-2 text-sm text-rose-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-zinc-300">
              Email / User ID <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
              placeholder="superadmin@mobilearena.com"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-300">
              Password <span className="text-red-600">*</span>
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {!socialLoading && socialAvailable && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
              <span className="h-px flex-1 bg-zinc-700" />
              or
              <span className="h-px flex-1 bg-zinc-700" />
            </div>
            <GoogleSignInButton
              onCredential={(token) => void handleGoogle(token)}
              onError={() => setError("Google Sign-In failed.")}
            />
          </>
        )}
      </div>
    </div>
  );
}
