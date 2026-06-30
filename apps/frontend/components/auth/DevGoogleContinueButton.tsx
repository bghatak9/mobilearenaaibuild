"use client";

import { useState } from "react";

import { GoogleLogo } from "@/components/auth/SocialAuthIcons";
import { SocialContinueButton } from "@/components/auth/SocialContinueButton";
import { devSocialSignIn } from "@/lib/api";

type DevGoogleContinueButtonProps = {
  disabled?: boolean;
  onSession: (accessToken: string) => void;
  onError?: (message: string) => void;
};

/** Local dev sign-in when GOOGLE_CLIENT_ID is not configured. */
export function DevGoogleContinueButton({
  disabled = false,
  onSession,
  onError,
}: DevGoogleContinueButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const email = window.prompt(
      "Development mode: enter the email for your Google test account",
    );
    if (!email?.trim()) return;

    setLoading(true);
    try {
      const { access_token } = await devSocialSignIn("google", email.trim());
      onSession(access_token);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Development Google sign-in failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SocialContinueButton
      label="Continue with Google"
      icon={<GoogleLogo className="h-4 w-4" />}
      onClick={() => void handleClick()}
      disabled={disabled}
      loading={loading}
    />
  );
}
