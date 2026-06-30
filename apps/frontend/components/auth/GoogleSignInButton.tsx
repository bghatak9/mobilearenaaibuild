"use client";

import { useEffect, useRef, useState } from "react";

import { DevGoogleContinueButton } from "@/components/auth/DevGoogleContinueButton";
import { useSocialAuthConfig } from "@/hooks/useSocialAuthConfig";
import {
  ensureGoogleIdentityInitialized,
  loadGoogleIdentityScript,
  renderGoogleSignInButton,
  setGoogleCredentialHandlers,
} from "@/lib/google-identity";
import { isDevSocialClientId } from "@/lib/social-auth-dev";

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void;
  onDevSession?: (accessToken: string) => void;
  onError?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
  allowDevFlow?: boolean;
};

export function GoogleSignInButton({
  onCredential,
  onDevSession,
  onError,
  text = "signin_with",
  allowDevFlow = false,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const { config, loading } = useSocialAuthConfig();
  const [ready, setReady] = useState(false);

  const clientId = config.googleClientId;
  const enabled = !loading && config.googleSignInEnabled && Boolean(clientId);
  const useDevFlow =
    allowDevFlow &&
    enabled &&
    (config.googleUseDevFlow || isDevSocialClientId(clientId));

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
    setGoogleCredentialHandlers(
      (token) => onCredentialRef.current(token),
      () => onErrorRef.current?.(),
    );
  }, [onCredential, onError]);

  useEffect(() => {
    if (!enabled || useDevFlow || !clientId) return;

    let cancelled = false;

    async function mount() {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !containerRef.current) return;

        ensureGoogleIdentityInitialized(clientId);
        renderGoogleSignInButton(containerRef.current, 320, text);
        setReady(true);
      } catch {
        onErrorRef.current?.();
      }
    }

    void mount();

    return () => {
      cancelled = true;
    };
  }, [enabled, useDevFlow, clientId, text]);

  if (!enabled) return null;

  if (useDevFlow && onDevSession) {
    return (
      <div className="mt-4">
        <DevGoogleContinueButton
          onSession={onDevSession}
          onError={() => onError?.()}
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!ready && (
        <p className="mb-2 text-center text-xs text-gray-400">
          Loading Google Sign-In…
        </p>
      )}
      <div
        ref={containerRef}
        className="google-continue-host flex justify-center"
      />
    </div>
  );
}
