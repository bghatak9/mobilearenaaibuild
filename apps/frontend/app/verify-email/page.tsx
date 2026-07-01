"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import { resendVerification, verifyEmail } from "@/lib/api";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await verifyEmail({ email, token });
      setMsg(res.message);
      setTimeout(() => router.replace("/profile"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await resendVerification(email);
      setMsg(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Confirm your address to unlock comments, polls, and profile features."
      error={error}
      info={msg}
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          <Link href="/login" className="text-[var(--electric-cyan)] hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={(e) => void handleVerify(e)} className="arena-auth-form space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Verification token"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          hint="Check your inbox — in dev, OTP_DEV_EXPOSE returns the token on register."
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={loading || !email}
        className="mt-4 w-full text-center text-sm text-[var(--electric-cyan)] hover:underline disabled:opacity-50"
      >
        Resend verification email
      </button>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<div className="arena-auth-card p-6 text-center">Loading…</div>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthPageLayout>
  );
}
