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
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  if (!token) return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const visibleNav = getNavForRole(user?.role);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-zinc-950 text-white">
        <Link
          href={visibleNav[0]?.href ?? "/admin"}
          className="px-5 py-4 text-xl font-extrabold"
        >
          Mobile<span className="text-red-600">Arena</span>
          <span className="ml-1 text-xs font-medium text-zinc-400">admin</span>
        </Link>

        {user && (
          <div className="border-b border-zinc-800 px-5 pb-3 text-xs text-zinc-400">
            <p className="truncate font-medium text-zinc-200">
              {user.name ?? user.email}
            </p>
            <p className="mt-0.5 uppercase tracking-wide text-zinc-500">
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
                    : "text-zinc-300 hover:bg-zinc-800"
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
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          <LogOut size={18} /> Sign out
        </button>
        <Link
          href="/"
          className="border-t border-zinc-800 px-5 py-3 text-xs text-zinc-500 hover:text-zinc-300"
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
