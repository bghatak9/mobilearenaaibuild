"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import { submitContactMessage } from "@/lib/api";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useToast } from "@/design-system/feedback/Toast";
import { cn } from "@/design-system/utils/cn";
import { useSiteLanguage } from "@/lib/site-language";

type ContactFormProps = {
  variant?: "home" | "page";
  className?: string;
};

export function ContactForm({ variant = "home", className }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useSiteLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      toast("Message sent — we'll get back to you soon.", "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send message", "error");
    } finally {
      setLoading(false);
    }
  }

  const isPage = variant === "page";

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={cn(
        "grid gap-4 ",
        isPage ? "sm:grid-cols-2" : "max-w-xl",
        className,
      )}
    >
      <Input
        label={t("contact.name")}
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("contact.namePlaceholder")}
        className={isPage ? undefined : "sm:col-span-2"}
      />
      <Input
        type="email"
        label={t("contact.email")}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={isPage ? undefined : "sm:col-span-2"}
      />
      <Input
        label={t("contact.subject")}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder={t("contact.subjectPlaceholder")}
        className="sm:col-span-2"
      />
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1.5 block font-medium text-[var(--text-primary)]">
          {t("contact.message")}
        </span>
        <textarea
          required
          rows={isPage ? 6 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("contact.messagePlaceholder")}
          className={cn(
            "w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5",
            "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
            "outline-none transition duration-150",
            "focus:border-[var(--ma-brand)]/50 focus:ring-2 focus:ring-[var(--ma-brand)]/25",
          )}
        />
      </label>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          "sm:col-span-2",
        )}
      >
        <p className="text-xs text-[var(--text-secondary)]">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-[var(--electric-cyan)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          {variant === "home" ? (
            <>
              {" "}
              ·{" "}
              <Link
                href="/contact"
                className="font-medium text-[var(--electric-cyan)] hover:underline"
              >
                {t("contact.fullPage")}
              </Link>
            </>
          ) : null}
        </p>
        <Button type="submit" loading={loading} className="shrink-0">
          {t("contact.send")}
        </Button>
      </div>
    </form>
  );
}
