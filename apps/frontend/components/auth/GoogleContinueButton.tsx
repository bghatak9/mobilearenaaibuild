"use client";

import { useEffect, useRef, useState } from "react";

import {
  ensureGoogleIdentityInitialized,
  loadGoogleIdentityScript,
  renderGoogleSignInButton,
  setGoogleCredentialHandlers,
} from "@/lib/google-identity";
import { cn } from "@/design-system/utils/cn";

type GoogleContinueButtonProps = {
  clientId: string;
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function GoogleContinueButton({
  clientId,
  onCredential,
  onError,
  disabled = false,
}: GoogleContinueButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
    setGoogleCredentialHandlers(
      (token) => onCredentialRef.current(token),
      () =>
        onErrorRef.current?.(
          "Google Sign-In was cancelled or did not return a credential.",
        ),
    );
  }, [onCredential, onError]);

  useEffect(() => {
    if (!clientId || disabled) return;

    let observer: ResizeObserver | null = null;
    let cancelled = false;

    async function mount() {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !containerRef.current) return;

        ensureGoogleIdentityInitialized(clientId);

        const render = () => {
          if (!containerRef.current) return;
          renderGoogleSignInButton(
            containerRef.current,
            containerRef.current.offsetWidth,
          );
        };

        render();
        setReady(true);
        observer = new ResizeObserver(render);
        observer.observe(containerRef.current);
      } catch {
        onErrorRef.current?.(
          "Google Sign-In could not be loaded. Check your connection and try again.",
        );
      }
    }

    void mount();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [clientId, disabled]);

  if (!clientId) return null;

  return (
    <div className="google-continue-host w-full min-w-0">
      {!ready ? (
        <div
          className="social-continue-btn flex w-full items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] opacity-70"
          aria-hidden
        >
          Loading Google…
        </div>
      ) : null}
      <div
        ref={containerRef}
        className={cn("w-full", !ready && "sr-only")}
        aria-label="Continue with Google"
      />
    </div>
  );
}
