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
import { usePathname, useRouter } from "next/navigation";

import { getMyProfile, type UserProfile } from "@/lib/api";
import { useSiteAuth } from "@/lib/site-auth";

type RefreshOptions = {
  silent?: boolean;
};

type ProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  setProfile: (p: UserProfile) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useSiteAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: RefreshOptions) => {
    if (!user) return;
    const silent = options?.silent === true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  useEffect(() => {
    if (!ready || !user) return;
    void refresh();
  }, [ready, user, refresh]);

  const value = useMemo(
    () => ({ profile, loading, error, refresh, setProfile }),
    [profile, loading, error, refresh],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
