import type { ReactNode } from "react";

import { AuthCloseButton } from "@/components/auth/AuthCloseButton";
import { cn } from "@/design-system/utils/cn";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  error?: string | null;
  info?: string | null;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  closeHref?: string;
  showClose?: boolean;
};

export function AuthCard({
  title,
  subtitle,
  error,
  info,
  footer,
  children,
  className,
  closeHref = "/",
  showClose = true,
}: AuthCardProps) {
  return (
    <div className={cn("arena-auth-card", className)}>
      {showClose ? <AuthCloseButton href={closeHref} /> : null}

      <header className="arena-auth-header">
        <h1 className="arena-auth-title">{title}</h1>
        {subtitle ? <p className="arena-auth-subtitle">{subtitle}</p> : null}
      </header>

      {info ? (
        <p className="arena-auth-info" role="status">
          {info}
        </p>
      ) : null}

      {error ? (
        <p className="arena-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      {children}

      {footer ? <div className="arena-auth-footer">{footer}</div> : null}
    </div>
  );
}

export function AuthDivider({ children }: { children: string }) {
  return <p className="arena-auth-divider">{children}</p>;
}
