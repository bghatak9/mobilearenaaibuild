"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/design-system/buttons/Button";
import { Input } from "@/design-system/forms/Input";
import { Card } from "@/design-system/cards/Card";
import { subscribeNewsletter } from "@/lib/api";
import { useToast } from "@/design-system/feedback/Toast";

export function NewsletterSignupSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await subscribeNewsletter(email.trim());
      toast("You're on the list! Welcome to the Arena.", "success");
      setEmail("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="newsletter-signup">
      <Card className="relative overflow-hidden border-[var(--border-accent-purple)]" hover={false}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--aurora-purple)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-0 h-32 w-32 rounded-full bg-[var(--electric-cyan)]/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[var(--electric-cyan)]">
              <Mail size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Arena Newsletter
              </span>
            </div>
            <h2
              id="newsletter-signup"
              className="text-2xl font-extrabold text-[var(--text-primary)]"
            >
              Stay ahead of every launch
            </h2>
            <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
              Weekly picks, deal alerts, and community highlights — no spam, unsubscribe anytime.
            </p>
          </div>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              aria-label="Email for newsletter"
            />
            <Button type="submit" loading={loading} className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
}
