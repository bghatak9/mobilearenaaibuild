"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Scale, Sparkles } from "lucide-react";

import PhoneGrid from "@/components/phone/PhoneGrid";
import { Button } from "@/design-system/buttons/Button";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { SearchBar } from "@/design-system/forms/SearchBar";
import {
  COMPARE_HUB_LINKS,
  COMPARE_LAB_LINKS,
  readTrendingComparisons,
} from "@/features/comparison";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";
import { useClientMounted } from "@/hooks/useClientMounted";
import { useSiteLanguage } from "@/lib/site-language";

export function CompareHubLanding() {
  const router = useRouter();
  const mounted = useClientMounted();
  const { items, compareHref, clear } = useCompare();
  const [search, setSearch] = useState("");
  const trending = mounted ? readTrendingComparisons(6) : [];
  const { t } = useSiteLanguage();

  return (
    <div className="space-y-10">
      <header className="">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
          {t("compare.title")}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)] md:text-4xl">
          {t("compare.subtitle")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
          {t("compare.hubBody", { max: MAX_COMPARE })}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COMPARE_HUB_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-[var(--electric-cyan)]/40"
          >
            <p className="font-bold text-[var(--text-primary)]">{link.label}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      {items.length > 0 && (
        <SpectrumPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[var(--text-primary)]">
                {t("compare.currentSelection")} ({items.length}/{MAX_COMPARE})
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {items.map((i) => i.name).join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={clear}>
                {t("compare.clear")}
              </Button>
              {compareHref ? (
                <Button type="button" onClick={() => router.push(compareHref)}>
                  <Scale size={16} /> {t("compare.compareNow")}
                </Button>
              ) : (
                <span className="text-sm text-[var(--text-secondary)]">
                  {t("compare.addMore", { count: Math.max(2 - items.length, 1) })}
                </span>
              )}
            </div>
          </div>
        </SpectrumPanel>
      )}

      <SpectrumPanel className="p-5">
        <h2 className="mb-3 font-bold text-[var(--text-primary)]">
          {t("compare.labsTitle")}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARE_LAB_LINKS.map((lab) => (
            <Link
              key={lab.id}
              href={
                compareHref
                  ? `${compareHref}?tab=${lab.id}`
                  : `/compare/select?lab=${lab.id}`
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--electric-cyan)]/40"
            >
              <span>{lab.emoji}</span>
              {lab.label}
              <ArrowRight size={14} className="ml-auto text-[var(--text-secondary)]" />
            </Link>
          ))}
        </div>
      </SpectrumPanel>

      {trending.length > 0 && (
        <SpectrumPanel className="p-5">
          <h2 className="mb-3 font-bold text-[var(--text-primary)]">
            {t("compare.trendingTitle")}
          </h2>
          <ul className="space-y-2">
            {trending.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/compare/${t.slug}`}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  <span>{t.label}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {t.count} compares
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/compare/trending"
            className="mt-3 inline-block text-sm font-semibold text-[var(--electric-cyan)]"
          >
            View all trending →
          </Link>
        </SpectrumPanel>
      )}

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Add devices to compare
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Tap the scale icon on any phone card (up to {MAX_COMPARE} devices).
            </p>
          </div>
          <Link
            href="/compare/advanced"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--electric-cyan)]"
          >
            <Sparkles size={14} /> AI recommendation wizard
          </Link>
        </div>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={(q) => setSearch(q)}
          placeholder={t("compare.searchPlaceholder")}
          className="mb-4"
        />
        <PhoneGrid search={search} pageSize={9} swipePaginate />
      </div>
    </div>
  );
}
