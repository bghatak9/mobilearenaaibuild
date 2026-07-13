"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { ContactForm } from "@/components/contact/ContactForm";
import { ContactTopics } from "@/components/contact/ContactTopics";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { CONTACT_EMAIL } from "@/lib/contact";

export function ContactPageInner() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");

  return (
    <>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: tCommon("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />
      <SpectrumPanel className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6 flex items-center gap-2 text-[var(--electric-cyan)]">
          <MessageCircle size={22} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {t("eyebrow")}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          {t.rich("intro", {
            email: () => (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-[var(--electric-cyan)] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            ),
          })}
        </p>

        <ContactTopics />

        <div className="mt-8">
          <ContactForm variant="page" />
        </div>
      </SpectrumPanel>
    </>
  );
}
