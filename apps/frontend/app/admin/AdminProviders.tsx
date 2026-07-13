"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/design-system/feedback/Toast";

/** Minimal providers for `/admin` (outside `[locale]`). */
export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
