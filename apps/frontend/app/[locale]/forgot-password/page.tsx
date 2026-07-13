"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { ClientAuthPageLayout } from "@/components/auth/ClientAuthPageLayout";
import { PasswordRequirementHint } from "@/components/auth/PasswordRequirementHint";
import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import {
  formatCooldown,
  useResendCooldown,
} from "@/hooks/useResendCooldown";
import { requestPasswordReset, resetPasswordWithOtp } from "@/lib/api";
import { passwordValidationMessage } from "@/lib/password-policy";

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { secondsLeft, canResend, startCooldown } = useResendCooldown();

  async function sendVerificationCode() {
    const result = await requestPasswordReset({ email });
    if (result.devOtp) setDevOtp(result.devOtp);
    else setDevOtp(null);
    startCooldown();
    setStep("reset");
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await sendVerificationCode();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend || resendLoading || !email) return;

    setError(null);
    setResendLoading(true);
    try {
      await sendVerificationCode();
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resendFailed"));
    } finally {
      setResendLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }
    const passwordError = passwordValidationMessage(newPassword, "USER");
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await resetPasswordWithOtp({ email, otp, newPassword });
      setInfo(result.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resetFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientAuthPageLayout>
      <AuthCard
        title={t("resetPassword")}
        subtitle={
          step === "request" ? t("resetSubtitle") : t("resetCodeSubtitle")
        }
        error={error}
        info={step === "reset" ? info : null}
        footer={
          <p className="arena-auth-footer-text">
            <Link href="/login" className="arena-auth-link">
              {t("backToSignIn")}
            </Link>
          </p>
        }
      >
        {devOtp ? (
          <p className="arena-auth-dev-hint">
            {t("devOtp")}{" "}
            <span className="font-mono font-semibold">{devOtp}</span>
          </p>
        ) : null}

        {step === "request" ? (
          <form onSubmit={handleRequest} className="arena-auth-form">
            <Input
              label={t("emailAddress")}
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} size="sm" className="w-full">
              {t("sendCode")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="arena-auth-form">
            <Input
              label={t("verificationCode")}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder={t("codePlaceholder")}
              className="font-mono tracking-[0.2em]"
            />

            <div>
              <Input
                label={t("newPassword")}
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordRequirementHint className="mt-1 text-[0.6875rem] text-[var(--text-secondary)]" />
            </div>

            <Input
              label={t("confirmNewPassword")}
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" loading={loading} size="sm" className="w-full">
              {t("updatePassword")}
            </Button>

            <div className="arena-auth-resend">
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={!canResend || resendLoading || loading}
                className="arena-auth-resend-btn"
              >
                {resendLoading
                  ? t("sendingCode")
                  : canResend
                    ? t("resendCode")
                    : t("resendCodeIn", { time: formatCooldown(secondsLeft) })}
              </button>
              {!canResend && !resendLoading ? (
                <span className="arena-auth-resend-hint">
                  {t("resendCooldownHint")}
                </span>
              ) : null}
            </div>
          </form>
        )}
      </AuthCard>
    </ClientAuthPageLayout>
  );
}
