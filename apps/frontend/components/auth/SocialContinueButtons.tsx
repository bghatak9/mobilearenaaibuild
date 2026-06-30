"use client";

import { FacebookContinueButton } from "@/components/auth/FacebookContinueButton";
import { GoogleContinueButton } from "@/components/auth/GoogleContinueButton";
import { useSocialAuthConfig } from "@/hooks/useSocialAuthConfig";

type SocialContinueButtonsProps = {
  disabled?: boolean;
  onGoogleCredential: (idToken: string) => void;
  onFacebookAccessToken: (accessToken: string) => void;
  onError?: (message: string) => void;
};

export function SocialContinueButtons({
  disabled = false,
  onGoogleCredential,
  onFacebookAccessToken,
  onError,
}: SocialContinueButtonsProps) {
  const { config, loading } = useSocialAuthConfig();

  if (loading) return null;

  const showGoogle = config.googleSignInEnabled && config.googleClientId;
  const showFacebook = config.facebookSignInEnabled && config.facebookAppId;

  if (!showGoogle && !showFacebook) return null;

  return (
    <div className="min-w-0 space-y-2">
      {showGoogle ? (
        <GoogleContinueButton
          clientId={config.googleClientId}
          disabled={disabled}
          onCredential={onGoogleCredential}
          onError={(message) => onError?.(message)}
        />
      ) : null}
      {showFacebook ? (
        <FacebookContinueButton
          appId={config.facebookAppId}
          disabled={disabled}
          onAccessToken={onFacebookAccessToken}
          onError={(message) => onError?.(message)}
        />
      ) : null}
    </div>
  );
}
