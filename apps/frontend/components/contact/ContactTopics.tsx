"use client";

import { Headphones, Mail, Megaphone, Newspaper, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";

const TOPICS: {
  id: "support" | "editorial" | "advertising" | "privacy" | "general";
  icon: LucideIcon;
}[] = [
  { id: "support", icon: Headphones },
  { id: "editorial", icon: Newspaper },
  { id: "advertising", icon: Megaphone },
  { id: "privacy", icon: Shield },
  { id: "general", icon: Mail },
];

export function ContactTopics() {
  const t = useTranslations("contact.topics");

  return (
    <SwipePagedList
      items={TOPICS}
      getKey={(topic) => topic.id}
      listClassName="grid gap-4 sm:grid-cols-2"
      pageSize={2}
      className="mb-8"
      renderItem={(topic) => {
        const Icon = topic.icon;
        return (
          <SpectrumPanel className="h-full p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 text-[var(--electric-cyan)]">
              <Icon size={18} />
            </div>
            <h2 className="font-bold text-[var(--text-primary)]">
              {t(`${topic.id}.title`)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {t(`${topic.id}.description`)}
            </p>
          </SpectrumPanel>
        );
      }}
    />
  );
}
