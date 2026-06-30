import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

import { Card } from "@/design-system/cards/Card";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT_EMAIL } from "@/lib/contact";

export function ContactSection() {
  return (
    <section aria-labelledby="contact-home" className="arena-home-section">
      <Card
        className="relative overflow-hidden border-[var(--border-accent-cyan)]"
        hover={false}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--electric-cyan)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-28 w-28 rounded-full bg-[var(--aurora-purple)]/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[var(--electric-cyan)]">
              <MessageCircle size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Contact
              </span>
            </div>
            <h2
              id="contact-home"
              className="text-2xl font-extrabold text-[var(--text-primary)]"
            >
              Get in touch
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
              Questions about devices, partnerships, or your account? Send us a
              message and the MobileArena team will respond within 1–2 business
              days.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Mail size={16} className="shrink-0 text-[var(--electric-cyan)]" />
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-[var(--text-primary)] transition hover:text-[var(--electric-cyan)]"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <p className="mt-3 text-xs text-[var(--text-secondary)]">
              Prefer a dedicated page?{" "}
              <Link
                href="/contact"
                className="font-medium text-[var(--electric-cyan)] hover:underline"
              >
                Open contact form
              </Link>
            </p>
          </div>
          <ContactForm variant="home" />
        </div>
      </Card>
    </section>
  );
}
