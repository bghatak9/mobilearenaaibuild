"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/design-system/utils/cn";
import { Button } from "@/design-system/buttons/Button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={cn(
          "spectrum-panel relative z-10 flex max-h-[min(90dvh,100%)] w-full flex-col overflow-hidden rounded-t-[24px] p-4 shadow-xl sm:max-h-[90dvh] sm:rounded-[24px] sm:p-6",
          sizes[size],
        )}
      >
        <div className="mb-3 flex shrink-0 items-start justify-between gap-4 sm:mb-4">
          <h2 id="modal-title" className="text-lg font-bold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain text-[var(--text-secondary)]">
          {children}
        </div>
        {footer ? (
          <div className="mt-4 shrink-0 border-t border-white/10 pt-4 sm:mt-6 sm:flex sm:justify-end sm:gap-2 sm:border-0 sm:pt-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </>
  );
}
