"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ClientArenaShell } from "@/components/layout/ClientArenaShell";
import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
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
    <GlassPanel className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
        Verify your email
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Confirm your address to unlock comments, polls, and profile features.
      </p>

      <form onSubmit={(e) => void handleVerify(e)} className="mt-6 space-y-4">
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
        {error && <p className="text-sm text-[var(--rose-alert)]">{error}</p>}
        {msg && <p className="text-sm text-[var(--emerald-success)]">{msg}</p>}
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

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        <Link href="/login" className="text-[var(--electric-cyan)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </GlassPanel>
  );
}

export default function VerifyEmailPage() {
  return (
    <ClientArenaShell>
      <Suspense fallback={<GlassPanel className="mx-auto max-w-md p-8">Loading…</GlassPanel>}>
        <VerifyEmailForm />
      </Suspense>
    </ClientArenaShell>
  );
}
