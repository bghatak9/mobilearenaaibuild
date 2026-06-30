"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  AuthCard,
} from "@/components/auth/AuthCard";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { SocialAuthBlock } from "@/components/auth/SocialAuthBlock";
import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import { facebookSignIn, googleSignIn, login, setToken } from "@/lib/api";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finishLogin(accessToken: string) {
    setToken(accessToken);
    window.location.href = nextPath.startsWith("/") ? nextPath : "/";
  }

  function handleDevSession(accessToken: string) {
    setError(null);
    void finishLogin(accessToken);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await login(identifier, password);
      await finishLogin(access_token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email/User ID or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(idToken: string) {
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await googleSignIn(idToken);
      await finishLogin(access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebook(accessToken: string) {
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await facebookSignIn(accessToken);
      await finishLogin(access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Facebook sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Access your account to save favorites and join the community."
      error={error}
      footer={
        <AuthFooterLink
          prompt="No account?"
          href="/signup"
          label="Create one"
        />
      }
    >
      <SocialAuthBlock
        dividerLabel="or continue with email"
        disabled={loading}
        onGoogleCredential={(token) => void handleGoogle(token)}
        onFacebookAccessToken={(token) => void handleFacebook(token)}
        onDevSession={handleDevSession}
        onError={(message) => setError(message)}
      />

      <form onSubmit={handlePasswordSubmit} className="arena-auth-form">
        <Input
          label="Email / User ID"
          type="text"
          required
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="text-right">
          <Link href="/forgot-password" className="arena-auth-link text-xs">
            Forgot password?
          </Link>
        </p>

        <Button type="submit" loading={loading} size="sm" className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
