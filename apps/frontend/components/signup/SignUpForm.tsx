"use client";

import { Link } from "@/i18n/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth");
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
    setError(t("agreeRequired"));
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
      setError(err instanceof Error ? err.message : t("registrationFailed"));
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
      setError(err instanceof Error ? err.message : t("googleSignUpFailed"));
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
      setError(err instanceof Error ? err.message : t("facebookSignUpFailed"));
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
        title={t("welcomeArena")}
        subtitle={t("accountReady")}
        className="text-center"
      >
        <div className="arena-auth-success-icon">
          <CheckCircle2 aria-hidden />
        </div>
        <Link
          href="/"
          className="arena-btn-primary mt-5 inline-flex px-5 py-2 text-sm"
        >
          {t("enterArena")}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("createAccount")}
      subtitle={t("joinSubtitle")}
      error={error}
      footer={
        <AuthFooterLink
          prompt={t("haveAccount")}
          href="/login"
          label={t("signIn")}
        />
      }
    >
      <SocialAuthBlock
        dividerLabel={t("orSignUpEmail")}
        disabled={loading}
        onGoogleCredential={(token) => void handleGoogle(token)}
        onFacebookAccessToken={(token) => void handleFacebook(token)}
        onDevSession={handleDevSession}
        onError={(message) => setError(message)}
      />

      <form onSubmit={handleSubmit} className="arena-auth-form">
        <Input
          label={t("fullName")}
          type="text"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label={t("emailAddress")}
          type="email"
          required
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <Input
            label={t("password")}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
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
          {loading ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>
    </AuthCard>
  );
}
