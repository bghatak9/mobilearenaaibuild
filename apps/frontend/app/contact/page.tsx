import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the MobileArena team for support, partnerships, and general inquiries.",
};

export default function ContactPage() {
  return (
    <ArenaShell showAds={false}>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />
      <SpectrumPanel className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6 flex items-center gap-2 text-[var(--electric-cyan)]">
          <MessageCircle size={22} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Contact
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
          Contact MobileArena
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          We&apos;re here for product questions, editorial feedback, advertising
          inquiries, and account help. Reach us by form or email at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-[var(--electric-cyan)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <div className="mt-8">
          <ContactForm variant="page" />
        </div>
      </SpectrumPanel>
    </ArenaShell>
  );
}
