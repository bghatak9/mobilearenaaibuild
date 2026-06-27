"use client";

import type { ReactNode } from "react";
import { CompareProvider } from "@/lib/compare-context";
import CompareBar from "@/components/compare/CompareBar";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CompareProvider>
      {children}
      <CompareBar />
    </CompareProvider>
  );
}
