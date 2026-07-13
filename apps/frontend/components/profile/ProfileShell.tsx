"use client";

import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  function handleLogout() {
    signOut();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/profile" ? pathname === "/profile" : pathname.startsWith(href);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: tCommon("home"), href: "/" },
    { label: t("myProfile"), href: "/profile" },
  ];
  const sub = PROFILE_NAV.find(
    (item) => item.href !== "/profile" && pathname.startsWith(item.href),
  );
  if (sub && pathname !== "/profile") {
    breadcrumbs.push({ label: t(sub.labelKey) });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 spectrum-panel p-4 lg:sticky lg:top-36 lg:w-64">
        <p className="hidden px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] lg:block">
          👤 {t("myProfile")}
        </p>
        <nav className="mt-0 flex gap-2 overflow-x-auto pb-1 lg:mt-3 lg:block lg:space-y-0.5 lg:overflow-visible">
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
                className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-150 lg:shrink lg:justify-between ${
                  active
                    ? "bg-[var(--arena-blue)]/20 text-[var(--electric-cyan)]"
                    : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] lg:bg-transparent"
                }`}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <Icon size={16} />
                  {t(item.labelKey)}
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
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium whitespace-nowrap text-zinc-700 hover:bg-zinc-50 lg:w-full lg:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LogOut size={16} />
            {t("logout")}
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Breadcrumbs className="mb-4" items={breadcrumbs} />
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
  return <div className="spectrum-panel rounded-[24px] p-6">{children}</div>;
}

export function ProfileLoading() {
  const t = useTranslations("common");
  return (
    <div className="flex items-center justify-center py-20 text-sm text-gray-500">
      {t("loading")}
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
