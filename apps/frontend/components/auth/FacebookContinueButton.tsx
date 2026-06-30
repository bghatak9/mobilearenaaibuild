"use client";

import { useCallback, useEffect, useState } from "react";

import { FacebookLogo } from "@/components/auth/SocialAuthIcons";
import { SocialContinueButton } from "@/components/auth/SocialContinueButton";

type FacebookContinueButtonProps = {
  appId: string;
  onAccessToken: (accessToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

type FacebookLoginResponse = {
  authResponse?: { accessToken: string };
  status?: string;
};

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: { scope: string },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

let facebookScriptPromise: Promise<void> | null = null;
let facebookReadyAppId: string | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.FB && facebookReadyAppId === appId) {
    return Promise.resolve();
  }

  if (facebookScriptPromise && facebookReadyAppId === appId) {
    return facebookScriptPromise;
  }

  facebookScriptPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
      facebookReadyAppId = appId;
      resolve();
    };

    if (window.FB) {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
      facebookReadyAppId = appId;
      resolve();
      return;
    }

    const existing = document.getElementById("facebook-jssdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Facebook SDK failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Facebook SDK failed"));
    document.body.appendChild(script);
  });

  return facebookScriptPromise;
}

export function FacebookContinueButton({
  appId,
  onAccessToken,
  onError,
  disabled = false,
}: FacebookContinueButtonProps) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appId) return;

    let cancelled = false;

    void loadFacebookSdk(appId)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) onError?.("Failed to load Facebook Sign-In.");
      });

    return () => {
      cancelled = true;
    };
  }, [appId, onError]);

  const handleClick = useCallback(() => {
    if (!appId) {
      onError?.("Facebook Sign-In is not configured yet.");
      return;
    }
    if (!ready || !window.FB) {
      onError?.("Facebook Sign-In is still loading. Try again.");
      return;
    }

    setLoading(true);
    window.FB.login(
      (response) => {
        setLoading(false);
        const token = response.authResponse?.accessToken;
        if (token) {
          onAccessToken(token);
          return;
        }
        if (response.status !== "unknown") {
          onError?.("Facebook sign-in was cancelled.");
        }
      },
      { scope: "email,public_profile" },
    );
  }, [appId, onAccessToken, onError, ready]);

  if (!appId) return null;

  return (
    <SocialContinueButton
      label="Continue with Facebook"
      icon={<FacebookLogo className="h-4 w-4" />}
      onClick={handleClick}
      disabled={disabled || !ready}
      loading={loading}
    />
  );
}
