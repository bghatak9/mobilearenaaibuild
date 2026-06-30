"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { useProfile } from "@/components/profile/ProfileProvider";
import { PROFILE_NAV } from "@/lib/profile-nav";
import { useSiteAuth } from "@/lib/site-auth";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import type { BreadcrumbItem } from "@/design-system/navigation/Breadcrumbs";

export function ProfileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSiteAuth();
  const { profile } = useProfile();

  function handleLogout() {
    signOut();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/profile" ? pathname === "/profile" : pathname.startsWith(href);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Profile", href: "/profile" },
  ];
  const sub = PROFILE_NAV.find(
    (item) => item.href !== "/profile" && pathname.startsWith(item.href),
  );
  if (sub && pathname !== "/profile") {
    breadcrumbs.push({ label: sub.label });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 glass-panel p-4 lg:w-64 lg:sticky lg:top-36">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          👤 My Profile
        </p>
        <nav className="mt-3 space-y-0.5">
          {PROFILE_NAV.map((item) => {
            const active = isActive(item.href);
            const count =
              item.badgeKey && profile
                ? profile.stats[item.badgeKey]
                : undefined;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ${
                  active
                    ? "bg-[var(--arena-blue)]/20 text-[var(--electric-cyan)]"
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} />
                  {item.label}
                </span>
                {typeof count === "number" && count > 0 && (
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold dark:bg-zinc-700">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
        {children}
      </div>
    </div>
  );
}

export function ProfilePageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

export function ProfilePanel({ children }: { children: ReactNode }) {
  return (
    <div className="glass-panel rounded-[20px] p-6">
      {children}
    </div>
  );
}

export function ProfileLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-sm text-gray-500">
      Loading profile…
    </div>
  );
}

export function ProfileError({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      {message}
    </div>
  );
}
