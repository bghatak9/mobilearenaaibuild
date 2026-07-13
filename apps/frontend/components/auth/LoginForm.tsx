"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth");
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
        err instanceof Error ? err.message : t("invalidCredentials"),
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
      setError(err instanceof Error ? err.message : t("googleFailed"));
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
      setError(err instanceof Error ? err.message : t("facebookFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={t("signIn")}
      subtitle={t("welcomeBack")}
      error={error}
      footer={
        <AuthFooterLink
          prompt={t("noAccount")}
          href="/signup"
          label={t("createOne")}
        />
      }
    >
      <SocialAuthBlock
        dividerLabel={t("orEmail")}
        disabled={loading}
        onGoogleCredential={(token) => void handleGoogle(token)}
        onFacebookAccessToken={(token) => void handleFacebook(token)}
        onDevSession={handleDevSession}
        onError={(message) => setError(message)}
      />

      <form onSubmit={handlePasswordSubmit} className="arena-auth-form">
        <Input
          label={t("identifier")}
          type="text"
          required
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t("emailPlaceholder")}
        />

        <Input
          label={t("password")}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="text-right">
          <Link href="/forgot-password" className="arena-auth-link text-xs">
            {t("forgotPassword")}
          </Link>
        </p>

        <Button type="submit" loading={loading} size="sm" className="w-full">
          {loading ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </AuthCard>
  );
}
