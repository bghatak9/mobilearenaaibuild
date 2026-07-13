"use client";

import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";

type AuthCloseButtonProps = {
  href?: string;
};

export function AuthCloseButton({ href = "/" }: AuthCloseButtonProps) {
  return (
    <Link href={href} className="arena-auth-close" aria-label="Close">
      <X size={14} strokeWidth={2.75} aria-hidden />
    </Link>
  );
}
