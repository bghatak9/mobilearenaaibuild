"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import {
  AuthCard,
} from "@/components/auth/AuthCard";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { PasswordRequirementHint } from "@/components/auth/PasswordRequirementHint";
import { SocialAuthBlock } from "@/components/auth/SocialAuthBlock";
import { SignupAgreementField } from "@/components/signup/SignupAgreementField";
import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import { facebookSignIn, googleSignIn, registerUser, setToken } from "@/lib/api";
import { passwordValidationMessage } from "@/lib/password-policy";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function requireAgreement(): boolean {
    if (agreedToTerms) return true;
    setError(
      "Please accept the Terms of Service, Privacy Policy, and Community Guidelines to continue.",
    );
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAgreement()) return;

    const passwordError = passwordValidationMessage(password, "USER");
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await registerUser({
        email,
        password,
        name: name.trim() || undefined,
      });
      setToken(result.access_token);
      if (result.verificationRequired) {
        const qs = new URLSearchParams({ email });
        if (result.devVerifyToken) qs.set("token", result.devVerifyToken);
        router.replace(`/verify-email?${qs.toString()}`);
        return;
      }
      router.replace("/signup?success=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(idToken: string) {
    if (!requireAgreement()) return;

    setError(null);
    setLoading(true);
    try {
      const { access_token } = await googleSignIn(idToken);
      setToken(access_token);
      router.replace("/signup?success=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebook(accessToken: string) {
    if (!requireAgreement()) return;

    setError(null);
    setLoading(true);
    try {
      const { access_token } = await facebookSignIn(accessToken);
      setToken(access_token);
      router.replace("/signup?success=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Facebook sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleDevSession(accessToken: string) {
    if (!requireAgreement()) return;
    setError(null);
    setToken(accessToken);
    router.replace("/signup?success=1");
  }

  if (success) {
    return (
      <AuthCard
        title="Welcome to the Arena"
        subtitle="Your account is ready. Explore phones, save favorites, and join the community."
        className="text-center"
      >
        <div className="arena-auth-success-icon">
          <CheckCircle2 aria-hidden />
        </div>
        <Link
          href="/"
          className="arena-btn-primary mt-5 inline-flex px-5 py-2 text-sm"
        >
          Enter the Arena
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Join in seconds to unlock member benefits — free forever."
      error={error}
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          href="/login"
          label="Sign in"
        />
      }
    >
      <SocialAuthBlock
        dividerLabel="or sign up with email"
        disabled={loading}
        onGoogleCredential={(token) => void handleGoogle(token)}
        onFacebookAccessToken={(token) => void handleFacebook(token)}
        onDevSession={handleDevSession}
        onError={(message) => setError(message)}
      />

      <form onSubmit={handleSubmit} className="arena-auth-form">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordRequirementHint className="mt-1 text-[0.6875rem] text-[var(--text-secondary)]" />
        </div>

        <SignupAgreementField
          checked={agreedToTerms}
          onChange={(checked) => {
            setAgreedToTerms(checked);
            if (checked) setError(null);
          }}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={!agreedToTerms}
          size="sm"
          className="w-full"
        >
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
