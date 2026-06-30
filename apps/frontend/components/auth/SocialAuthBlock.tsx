"use client";

import { AuthDivider } from "@/components/auth/AuthCard";
import { DevFacebookContinueButton } from "@/components/auth/DevFacebookContinueButton";
import { DevGoogleContinueButton } from "@/components/auth/DevGoogleContinueButton";
import { FacebookContinueButton } from "@/components/auth/FacebookContinueButton";
import { GoogleContinueButton } from "@/components/auth/GoogleContinueButton";
import { useSocialAuthConfig } from "@/hooks/useSocialAuthConfig";
import { isDevSocialClientId } from "@/lib/social-auth-dev";

type SocialAuthBlockProps = {
  dividerLabel: string;
  disabled?: boolean;
  onGoogleCredential: (idToken: string) => void;
  onFacebookAccessToken: (accessToken: string) => void;
  onDevSession: (accessToken: string) => void;
  onError?: (message: string) => void;
};

export function SocialAuthBlock({
  dividerLabel,
  disabled = false,
  onGoogleCredential,
  onFacebookAccessToken,
  onDevSession,
  onError,
}: SocialAuthBlockProps) {
  const { config, loading } = useSocialAuthConfig();

  if (loading) return null;

  const showGoogle = config.googleSignInEnabled && config.googleClientId;
  const showFacebook = config.facebookSignInEnabled && config.facebookAppId;

  if (!showGoogle && !showFacebook) return null;

  const googleDev = Boolean(config.googleUseDevFlow);
  const facebookDev = Boolean(config.facebookUseDevFlow);

  return (
    <>
      <div className="min-w-0 space-y-2">
        {showGoogle ? (
          googleDev || isDevSocialClientId(config.googleClientId) ? (
            <DevGoogleContinueButton
              disabled={disabled}
              onSession={onDevSession}
              onError={(message) => onError?.(message)}
            />
          ) : (
            <GoogleContinueButton
              clientId={config.googleClientId}
              disabled={disabled}
              onCredential={onGoogleCredential}
              onError={(message) => onError?.(message)}
            />
          )
        ) : null}
        {showFacebook ? (
          facebookDev || isDevSocialClientId(config.facebookAppId) ? (
            <DevFacebookContinueButton
              disabled={disabled}
              onSession={onDevSession}
              onError={(message) => onError?.(message)}
            />
          ) : (
            <FacebookContinueButton
              appId={config.facebookAppId}
              disabled={disabled}
              onAccessToken={onFacebookAccessToken}
              onError={(message) => onError?.(message)}
            />
          )
        ) : null}
      </div>
      <AuthDivider>{dividerLabel}</AuthDivider>
    </>
  );
}

export function useSocialAuthAvailable() {
  const { config, loading } = useSocialAuthConfig();
  return {
    loading,
    available:
      !loading &&
      ((config.googleSignInEnabled && Boolean(config.googleClientId)) ||
        (config.facebookSignInEnabled && Boolean(config.facebookAppId))),
  };
}
