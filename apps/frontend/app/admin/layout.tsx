"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Star,
  MessageSquare,
  LogOut,
} from "lucide-react";

import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Moderation", href: "/admin/comments", icon: MessageSquare },
];

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, ready, signOut } = useAdminAuth();

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

  if (!token) return null; // redirecting

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-zinc-950 text-white">
        <Link href="/admin" className="px-5 py-4 text-xl font-extrabold">
          Mobile<span className="text-red-600">Arena</span>
          <span className="ml-1 text-xs font-medium text-zinc-400">admin</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(({ label, href, icon: Icon }) => (
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
          ))}
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
