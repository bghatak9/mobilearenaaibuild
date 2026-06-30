"use client";

import { useEffect, useState } from "react";

import { fetchSocialAuthConfig, type SocialAuthConfig } from "@/lib/api";
import { FACEBOOK_APP_ID, FACEBOOK_SIGNIN_ENABLED } from "@/lib/facebook-auth";
import { GOOGLE_CLIENT_ID, GOOGLE_SIGNIN_ENABLED } from "@/lib/google-auth";
import { DEV_SOCIAL_CLIENT_ID } from "@/lib/social-auth-dev";

function envFallbackConfig(): SocialAuthConfig {
  return {
    googleClientId: GOOGLE_CLIENT_ID,
    facebookAppId: FACEBOOK_APP_ID,
    googleSignInEnabled: GOOGLE_SIGNIN_ENABLED,
    facebookSignInEnabled: FACEBOOK_SIGNIN_ENABLED,
    googleUseDevFlow: false,
    facebookUseDevFlow: false,
  };
}

function mergeWithEnvFallback(config: SocialAuthConfig): SocialAuthConfig {
  const googleClientId = config.googleClientId || GOOGLE_CLIENT_ID;
  const facebookAppId = config.facebookAppId || FACEBOOK_APP_ID;

  return {
    googleClientId,
    facebookAppId,
    googleSignInEnabled:
      config.googleSignInEnabled ||
      Boolean(googleClientId && googleClientId !== DEV_SOCIAL_CLIENT_ID) ||
      Boolean(config.googleUseDevFlow),
    facebookSignInEnabled:
      config.facebookSignInEnabled ||
      Boolean(facebookAppId && facebookAppId !== DEV_SOCIAL_CLIENT_ID) ||
      Boolean(config.facebookUseDevFlow),
    googleUseDevFlow: config.googleUseDevFlow ?? false,
    facebookUseDevFlow: config.facebookUseDevFlow ?? false,
  };
}

export function useSocialAuthConfig() {
  const [config, setConfig] = useState<SocialAuthConfig>(() =>
    mergeWithEnvFallback(envFallbackConfig()),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void fetchSocialAuthConfig()
      .then((remote) => {
        if (!cancelled) setConfig(mergeWithEnvFallback(remote));
      })
      .catch(() => {
        if (!cancelled) setConfig(mergeWithEnvFallback(envFallbackConfig()));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading };
}
