import { ArenaShell } from "@/components/layout/ArenaShell";

export async function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <ArenaShell auth>
      <div id="fb-root" />
      <div className="arena-auth-shell py-3 sm:py-5">{children}</div>
    </ArenaShell>
  );
}
