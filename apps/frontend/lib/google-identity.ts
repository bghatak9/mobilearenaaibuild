declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      accounts?: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              width?: number;
            },
          ) => void;
        };
      };
      translate?: {
        TranslateElement: (new (
          options: Record<string, unknown>,
          elementId: string,
        ) => void) & {
          InlineLayout?: { SIMPLE?: number; HORIZONTAL?: number };
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;
let gsiInitialized = false;

let credentialHandler: ((idToken: string) => void) | null = null;
let errorHandler: (() => void) | null = null;

export function setGoogleCredentialHandlers(
  onCredential: (idToken: string) => void,
  onError?: () => void,
): void {
  credentialHandler = onCredential;
  errorHandler = onError ?? null;
}

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function ensureGoogleIdentityInitialized(clientId: string): void {
  if (!window.google?.accounts?.id || gsiInitialized || !clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) credentialHandler?.(response.credential);
      else errorHandler?.();
    },
  });
  gsiInitialized = true;
}

export function renderGoogleSignInButton(
  container: HTMLElement,
  width: number,
  text: "signin_with" | "signup_with" | "continue_with" = "continue_with",
): void {
  if (!window.google?.accounts?.id) return;

  container.innerHTML = "";
  window.google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    text,
    width: Math.min(Math.max(Math.floor(width), 200), 400),
  });
}
