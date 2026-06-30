"use client";

import { useState } from "react";

import { FacebookLogo } from "@/components/auth/SocialAuthIcons";
import { SocialContinueButton } from "@/components/auth/SocialContinueButton";
import { devSocialSignIn } from "@/lib/api";

type DevFacebookContinueButtonProps = {
  disabled?: boolean;
  onSession: (accessToken: string) => void;
  onError?: (message: string) => void;
};

/** Local dev sign-in when Facebook app credentials are not configured. */
export function DevFacebookContinueButton({
  disabled = false,
  onSession,
  onError,
}: DevFacebookContinueButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const email = window.prompt(
      "Development mode: enter the email for your Facebook test account",
    );
    if (!email?.trim()) return;

    setLoading(true);
    try {
      const { access_token } = await devSocialSignIn("facebook", email.trim());
      onSession(access_token);
    } catch (err) {
      onError?.(
        err instanceof Error
          ? err.message
          : "Development Facebook sign-in failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SocialContinueButton
      label="Continue with Facebook"
      icon={<FacebookLogo className="h-4 w-4" />}
      onClick={() => void handleClick()}
      disabled={disabled}
      loading={loading}
    />
  );
}
