"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/design-system/utils/cn";

type ToastVariant = "default" | "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  default: "border-[var(--border-subtle)]",
  success: "border-[var(--emerald-success)]/40",
  error: "border-red-500/40",
};

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const t = useTranslations("a11y");
  return (
    <div
      className="pointer-events-none fixed bottom-20 z-[80] flex flex-col gap-2 inset-inline-end-4 md:bottom-6"
      aria-live="polite"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "spectrum-panel pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-lg",
            variantStyles[item.variant],
          )}
          role="status"
        >
          <p className="flex-1 text-sm text-[var(--text-primary)]">{item.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--electric-cyan)]"
            aria-label={t("dismissToast")}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "default") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        items={items}
        onDismiss={(id) => setItems((prev) => prev.filter((t) => t.id !== id))}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx;
}
