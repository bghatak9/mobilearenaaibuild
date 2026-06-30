"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getToken, setToken } from "@/lib/api";
import { decodeJwtPayload, type UserRole } from "@/lib/roles";

export type SiteUser = {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
};

type SiteAuthState = {
  user: SiteUser | null;
  ready: boolean;
  signOut: () => void;
};

const SiteAuthContext = createContext<SiteAuthState | null>(null);

const AUTH_CHANGE_EVENT = "ma-auth-change";

function userFromToken(token: string): SiteUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.role || payload.sub == null) return null;
  return {
    id: payload.sub,
    email: payload.email ?? "",
    name: payload.name ?? null,
    role: payload.role,
  };
}

export function SiteAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiteUser | null>(null);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => {
    const stored = getToken();
    setUser(stored ? userFromToken(stored) : null);
    setReady(true);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, sync);
  }, [sync]);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signOut }),
    [user, ready, signOut],
  );

  return (
    <SiteAuthContext.Provider value={value}>{children}</SiteAuthContext.Provider>
  );
}

export function useSiteAuth(): SiteAuthState {
  const ctx = useContext(SiteAuthContext);
  if (!ctx) {
    throw new Error("useSiteAuth must be used within SiteAuthProvider");
  }
  return ctx;
}
