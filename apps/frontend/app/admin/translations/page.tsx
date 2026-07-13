import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

import { RoleGate } from "@/components/admin/RoleGate";
import { TranslationCoveragePanel } from "@/components/admin/translations/TranslationCoveragePanel";
import {
  MESSAGE_NAMESPACES,
  getMessagePackLocales,
  ENABLED_LOCALES,
} from "@/i18n/locales";

export const dynamic = "force-dynamic";

type LocaleReport = {
  locale: string;
  curated: boolean;
  namespacesPresent: string[];
  namespacesMissing: string[];
  keyCount: number;
  missingVsEn: string[];
};

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...flattenKeys(v, next));
    } else {
      out.push(next);
    }
  }
  return out;
}

async function readNamespace(
  locale: string,
  ns: string,
): Promise<Record<string, unknown> | null> {
  try {
    const file = path.join(process.cwd(), "messages", locale, `${ns}.json`);
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function buildReport(): Promise<{
  enKeys: string[];
  reports: LocaleReport[];
}> {
  const enTrees = await Promise.all(
    MESSAGE_NAMESPACES.map((ns) => readNamespace("en", ns)),
  );
  const enKeys = new Set<string>();
  for (const tree of enTrees) {
    if (!tree) continue;
    for (const key of flattenKeys(tree)) enKeys.add(key);
  }

  const reports: LocaleReport[] = [];
  for (const locale of getMessagePackLocales()) {
    const present: string[] = [];
    const missingNs: string[] = [];
    const localeKeys = new Set<string>();
    for (const ns of MESSAGE_NAMESPACES) {
      const tree = await readNamespace(locale, ns);
      if (!tree) {
        missingNs.push(ns);
        continue;
      }
      present.push(ns);
      for (const key of flattenKeys(tree)) localeKeys.add(key);
    }
    const missingVsEn =
      locale === "en"
        ? []
        : [...enKeys].filter((k) => !localeKeys.has(k)).slice(0, 80);
    reports.push({
      locale,
      curated: true,
      namespacesPresent: present,
      namespacesMissing: missingNs,
      keyCount: localeKeys.size,
      missingVsEn,
    });
  }

  return { enKeys: [...enKeys].sort(), reports };
}

export default async function AdminTranslationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tab === "ui" ? "ui" : "coverage";
  const { enKeys, reports } = await buildReport();
  const packs = getMessagePackLocales();

  return (
    <RoleGate allowed={["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"]}>
      <div className="mx-auto max-w-5xl space-y-6 p-6 text-zinc-100">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Translation Center</h1>
          <p className="text-sm text-zinc-400">
            CMS coverage + UI message packs. Routing supports{" "}
            {ENABLED_LOCALES.length} enabled locales. Admin stays English-only.
          </p>
          <div className="flex gap-2 pt-2">
            <Link
              href="/admin/translations"
              className={`rounded-lg px-3 py-1.5 text-sm ${
                active === "coverage"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              CMS coverage
            </Link>
            <Link
              href="/admin/translations?tab=ui"
              className={`rounded-lg px-3 py-1.5 text-sm ${
                active === "ui"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              UI strings
            </Link>
          </div>
        </header>

        {active === "coverage" ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Content translation coverage
            </h2>
            <p className="text-xs text-zinc-500">
              English is canonical (100%). Other locales count rows in{" "}
              <code className="text-zinc-400">ContentTranslation</code> with
              prose or SEO fields.
            </p>
            <TranslationCoveragePanel />
          </section>
        ) : (
          <>
            <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                English UI catalog
              </h2>
              <p className="text-sm">
                {enKeys.length} keys across namespaced JSON files. Message packs:{" "}
                {packs.join(", ")}.
              </p>
            </section>

            <section className="space-y-4">
              {reports.map((report) => (
                <article
                  key={report.locale}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-medium">{report.locale}</h2>
                    <span className="text-xs text-zinc-500">
                      {report.keyCount} keys · {report.namespacesPresent.length}/
                      {MESSAGE_NAMESPACES.length} namespaces
                    </span>
                  </div>
                  {report.namespacesMissing.length > 0 ? (
                    <p className="mt-2 text-sm text-amber-300">
                      Missing namespace files:{" "}
                      {report.namespacesMissing.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-emerald-300">
                      All namespace files present.
                    </p>
                  )}
                  {report.missingVsEn.length > 0 ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-zinc-300">
                        Missing vs English ({report.missingVsEn.length}
                        {report.missingVsEn.length === 80 ? "+" : ""})
                      </summary>
                      <ul className="mt-2 max-h-48 overflow-auto font-mono text-xs text-zinc-400">
                        {report.missingVsEn.map((key) => (
                          <li key={key}>{key}</li>
                        ))}
                      </ul>
                    </details>
                  ) : report.locale !== "en" ? (
                    <p className="mt-2 text-sm text-emerald-300">
                      No missing keys vs English JSON.
                    </p>
                  ) : null}
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </RoleGate>
  );
}
