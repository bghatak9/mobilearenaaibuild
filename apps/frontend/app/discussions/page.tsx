"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { Avatar } from "@/design-system/feedback/Avatar";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { getDiscussions, type DiscussionThread } from "@/lib/api";

export default function DiscussionsPage() {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiscussions()
      .then(setThreads)
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ArenaShell>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Discussions" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Arena Discussions
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Community threads about phones, brands, and buying advice.
        </p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <GlassPanel className="p-8 text-center text-[var(--text-secondary)]">
            Loading discussions…
          </GlassPanel>
        ) : threads.length === 0 ? (
          <GlassPanel className="p-8 text-center text-[var(--text-secondary)]">
            No discussions yet. Start one from a phone page soon.
          </GlassPanel>
        ) : (
          threads.map((t) => (
            <GlassPanel key={t.id} className="p-5">
              <div className="flex gap-3">
                <Avatar src={t.user?.avatar} name={t.user?.name} size="sm" />
                <div>
                  <h2 className="font-bold text-[var(--text-primary)]">{t.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
                    {t.body}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                    <span>{t.user?.name ?? "Member"}</span>
                    <time dateTime={t.createdAt}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </time>
                    {t.device && (
                      <Link
                        href={`/phones/${t.device.slug}`}
                        className="text-[var(--electric-cyan)] hover:underline"
                      >
                        {t.device.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </ArenaShell>
  );
}
