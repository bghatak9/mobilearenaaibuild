"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_THEME, STORAGE_KEY } from "@/design-system/themes";

/** Titan Spectrum — dark luxury only (no light / Aurora Glass mode). */
export type Theme = "dark";

type ThemeContextValue = {
  theme: Theme;
  ready: boolean;
  setTheme: (theme: Theme) => void;
  /** @deprecated Light mode removed — no-op for compatibility */
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readStoredTheme(): Theme {
  return DEFAULT_THEME;
}

export function applyTheme(_theme: Theme = DEFAULT_THEME) {
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
  document.documentElement.style.colorScheme = "dark";
  try {
    localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    applyTheme();
    setReady(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme();
  }, []);

  const value = useMemo(
    () => ({
      theme: DEFAULT_THEME,
      ready,
      setTheme,
      toggleTheme,
    }),
    [ready, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
