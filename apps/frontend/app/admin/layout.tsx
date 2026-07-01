"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Star,
  MessageSquare,
  Users,
  LogOut,
  Settings,
  Shield,
  BarChart3,
  UserPlus,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { getNavForRole, type AdminNavItemDef } from "@/lib/admin-nav";
import { roleLabel } from "@/lib/roles";
import { TitanLogo, cn } from "@mobilearena/ui";

const ICONS: Record<AdminNavItemDef["icon"], LucideIcon> = {
  users: Users,
  settings: Settings,
  shield: Shield,
  "bar-chart": BarChart3,
  "user-plus": UserPlus,
  "file-text": FileText,
  newspaper: Newspaper,
  star: Star,
  "message-square": MessageSquare,
  "layout-dashboard": LayoutDashboard,
};

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, ready, signOut } = useAdminAuth();

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (ready && !token && !isLogin) {
      router.replace("/admin/login");
    }
  }, [ready, token, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary text-text-muted">
        Loading…
      </div>
    );
  }

  if (!token) return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const visibleNav = getNavForRole(user?.role);

  return (
    <div className="flex min-h-screen bg-bg-secondary">
      <aside className="flex w-60 flex-col border-r border-border-soft bg-surface-1 text-text-primary">
        <Link
          href={visibleNav[0]?.href ?? "/admin"}
          className="flex items-center gap-2 px-5 py-4 titan-display text-xl"
        >
          <TitanLogo className="h-7 w-7" />
          Mobile<span className="text-blue">Arena</span>
          <span className="ml-1 text-xs font-medium text-text-muted">admin</span>
        </Link>

        {user && (
          <div className="border-b border-border-soft px-5 pb-3 text-xs text-text-muted">
            <p className="truncate font-medium text-text-primary">
              {user.name ?? user.email}
            </p>
            <p className="mt-0.5 uppercase tracking-wide text-text-muted">
              {roleLabel(user.role)}
            </p>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-2">
          {visibleNav.map(({ label, href, icon }) => {
            const Icon = ICONS[icon];
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition",
                  isActive(href)
                    ? "titan-btn-primary text-white"
                    : "text-text-secondary hover:bg-surface-2",
                )}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            signOut();
            router.replace("/admin/login");
          }}
          className="m-3 flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2 transition"
        >
          <LogOut size={18} /> Sign out
        </button>
        <Link
          href="/"
          className="border-t border-border-soft px-5 py-3 text-xs text-text-muted hover:text-blue transition"
        >
          ← Back to site
        </Link>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <Shell>{children}</Shell>
    </AdminAuthProvider>
  );
}
