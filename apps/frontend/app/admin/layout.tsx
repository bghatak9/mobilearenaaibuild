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
  Upload,
  Megaphone,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { getNavForRole, type AdminNavItemDef } from "@/lib/admin-nav";
import { roleLabel } from "@/lib/roles";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import "./admin.css";

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
  upload: Upload,
  megaphone: Megaphone,
  revenue: DollarSign,
};

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, ready, signOut } = useAdminAuth();

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!ready) return;
    if (!token && !isLogin) {
      router.replace("/admin/login");
      return;
    }
    if (token && !user && !isLogin) {
      signOut();
      router.replace("/admin/login");
    }
  }, [ready, token, user, isLogin, router, signOut]);

  if (isLogin) return <>{children}</>;

  if (!ready) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center bg-gray-100 text-gray-500 dark:bg-zinc-950 dark:text-zinc-400">
        Loading…
      </div>
    );
  }

  if (!token) return null;

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  const visibleNav = getNavForRole(user?.role);

  return (
    <div className="admin-shell flex min-h-screen bg-gray-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <aside className="admin-sidebar flex w-60 flex-col border-r border-gray-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
        <div className="flex items-center border-b border-gray-200 px-4 py-3 dark:border-zinc-800">
          <ThemeToggle variant="admin" showLabel />
        </div>

        <Link
          href={visibleNav[0]?.href ?? "/admin"}
          className="px-5 py-4 text-xl font-extrabold text-zinc-900 dark:text-white"
        >
          Mobile<span className="text-red-600">Arena</span>
          <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            admin
          </span>
        </Link>

        {user && (
          <div className="border-b border-gray-200 px-5 pb-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
              {user.name ?? user.email}
            </p>
            <p className="mt-0.5 uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(href)
                    ? "bg-red-600 text-white"
                    : "text-zinc-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
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
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <LogOut size={18} /> Sign out
        </button>
        <Link
          href="/"
          className="border-t border-gray-200 px-5 py-3 text-xs text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          ← Back to site
        </Link>
      </aside>

      <main className="admin-content flex-1 overflow-x-hidden bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        {children}
      </main>
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
