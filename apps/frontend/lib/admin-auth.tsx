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
import type { UserRole } from "@/lib/roles";

import { getToken, setToken } from "@/lib/api";
import { decodeJwtPayload, isStaff } from "@/lib/roles";

type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  signIn: (token: string, user?: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function userFromToken(token: string, fallback?: AuthUser): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.role || payload.sub == null) return fallback ?? null;
  return {
    id: payload.sub,
    email: payload.email ?? "",
    name: payload.name ?? null,
    role: payload.role,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getToken();
    setTokenState(stored);
    if (stored) setUser(userFromToken(stored));
    setReady(true);
  }, []);

  const signIn = useCallback((next: string, explicit?: AuthUser) => {
    setToken(next);
    setTokenState(next);
    const resolved = explicit ?? userFromToken(next);
    if (resolved && !isStaff(resolved.role)) {
      setToken(null);
      setTokenState(null);
      setUser(null);
      return;
    }
    setUser(resolved);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, ready, signIn, signOut }),
    [token, user, ready, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAdminAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
