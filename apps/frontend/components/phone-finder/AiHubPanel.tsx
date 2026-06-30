"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  GitCompare,
  Mic,
  Scan,
  Sparkles,
  TrendingDown,
  Wand2,
} from "lucide-react";

import { ArPreviewModal } from "@/components/phone-finder/ArPreviewModal";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import {
  aiMatchFromProfile,
  budgetOptimizerRanked,
  buyingAssistantSuggestions,
  comparisonAlternatives,
  dailyDealsCategorized,
  formatMoney,
  identifyDeviceFromText,
  parseVoiceCommand,
  personalizedRecommendationsDetailed,
  tokensFromImageFilename,
  upgradeAdvisorDetailed,
  usdToInr,
  type AiMatchProfile,
} from "@/features/phone-finder";
import type { Device } from "@/lib/api";

const REASON_LABELS = {
  browsing: "Based on browsing history",
  wishlist: "Based on wishlists",
  community: "Based on community interests",
  comparisons: "Based on previous comparisons",
} as const;

const TABS = [
  { id: "match", label: "AI Match Me", icon: Sparkles },
  { id: "assistant", label: "Buying Assistant", icon: Wand2 },
  { id: "insights", label: "Insights", icon: GitCompare },
  { id: "voice", label: "Voice & AR", icon: Mic },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  devices: Device[];
  brands: string[];
  wishlistIds: Set<number>;
  compareAnchorSlug: string;
  onCompareAnchorChange: (slug: string) => void;
  onUpgradeQueryChange: (q: string) => void;
  upgradeQuery: string;
  onApplySearch: (q: string) => void;
  onApplyFilters: (patch: Record<string, unknown>) => void;
  onNavigate: (path: string) => void;
};

export function AiHubPanel({
  devices,
  brands,
  wishlistIds,
  compareAnchorSlug,
  onCompareAnchorChange,
  onUpgradeQueryChange,
  upgradeQuery,
  onApplySearch,
  onApplyFilters,
  onNavigate,
}: Props) {
  const [tab, setTab] = useState<TabId>("match");
  const [arDevice, setArDevice] = useState<Device | null>(null);

  const brandOptions = brands.filter((b) => b !== "All");

  const [profile, setProfile] = useState<AiMatchProfile>({
    budgetMax: 500,
    budgetCurrency: "USD",
    usage: "balanced",
    cameraImportance: 3,
    batteryExpectation: "all-day",
    preferredBrands: [],
  });

  const matches = useMemo(
    () => aiMatchFromProfile(devices, profile, 3),
    [devices, profile],
  );

  const [assistantQuery, setAssistantQuery] = useState(
    "Under ₹25K · best camera · good battery · minimal gaming",
  );
  const assistant = useMemo(
    () => buyingAssistantSuggestions(devices, assistantQuery),
    [devices, assistantQuery],
  );

  const personalized = useMemo(
    () => personalizedRecommendationsDetailed(devices, wishlistIds, 4),
    [devices, wishlistIds],
  );

  const comparison = useMemo(
    () => comparisonAlternatives(devices, compareAnchorSlug, 3),
    [devices, compareAnchorSlug],
  );

  const upgrade = useMemo(
    () => upgradeAdvisorDetailed(devices, upgradeQuery),
    [devices, upgradeQuery],
  );

  const budgetPicks = useMemo(
    () =>
      budgetOptimizerRanked(
        devices,
        profile.budgetCurrency === "INR"
          ? profile.budgetMax
          : usdToInr(profile.budgetMax),
        profile.budgetCurrency,
      ),
    [devices, profile.budgetMax, profile.budgetCurrency],
  );

  const deals = useMemo(() => dailyDealsCategorized(devices, 6), [devices]);

  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [imageResult, setImageResult] = useState<{
    match: Device | null;
    alternatives: Device[];
    label: string;
  } | null>(null);

  function toggleBrand(brand: string) {
    setProfile((p) => ({
      ...p,
      preferredBrands: p.preferredBrands.includes(brand)
        ? p.preferredBrands.filter((b) => b !== brand)
        : [...p.preferredBrands, brand],
    }));
  }

  function startVoice() {
    type SpeechRecognitionCtor = new () => {
      lang: string;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      start: () => void;
    };
    const W = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) {
      setVoiceTranscript("Voice search is not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onstart = () => setVoiceListening(true);
    rec.onend = () => setVoiceListening(false);
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setVoiceTranscript(text);
      handleVoiceCommand(text);
    };
    rec.onerror = () => setVoiceListening(false);
    rec.start();
  }

  function handleVoiceCommand(transcript: string) {
    const cmd = parseVoiceCommand(transcript);
    switch (cmd.type) {
      case "search":
        onApplySearch(cmd.query);
        break;
      case "filter":
        onApplyFilters(cmd.patch);
        break;
      case "compare":
        onApplySearch(cmd.query);
        break;
      case "navigate":
        onNavigate(cmd.path);
        break;
      default:
        onApplySearch(transcript);
    }
  }

  function handleImageUpload(file: File) {
    const tokens = tokensFromImageFilename(file.name);
    const text = tokens.join(" ");
    const result = identifyDeviceFromText(devices, text);
    setImageResult({
      ...result,
      label: file.name,
    });
  }

  return (
    <GlassPanel className="mb-6 overflow-hidden p-0">
      <div className="border-b border-white/10 bg-gradient-to-r from-[var(--arena-blue)]/20 to-[var(--aurora-purple)]/20 px-5 py-4">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Sparkles size={18} className="text-[var(--aurora-purple)]" />
          MobileArena AI
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Match Me, buying assistant, smart comparisons, voice search, image ID, and AR preview.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 py-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              tab === id
                ? "bg-[var(--arena-blue)]/30 text-[var(--electric-cyan)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "match" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
                🤖 AI Match Me
              </p>
              <label className="block text-sm">
                <span className="mb-1 text-[var(--text-secondary)]">Budget?</span>
                <div className="flex gap-2">
                  <select
                    value={profile.budgetCurrency}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        budgetCurrency: e.target.value as "USD" | "INR",
                      }))
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                  <input
                    type="number"
                    value={profile.budgetMax}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        budgetMax: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-1 text-[var(--text-secondary)]">Primary usage?</span>
                <select
                  value={profile.usage}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      usage: e.target.value as AiMatchProfile["usage"],
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <option value="balanced">Balanced</option>
                  <option value="gaming">Gaming</option>
                  <option value="photography">Photography</option>
                  <option value="business">Business</option>
                  <option value="social">Social / selfies</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 text-[var(--text-secondary)]">
                  Camera importance? ({profile.cameraImportance}/5)
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={profile.cameraImportance}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      cameraImportance: Number(e.target.value) as AiMatchProfile["cameraImportance"],
                    }))
                  }
                  className="w-full"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 text-[var(--text-secondary)]">Battery expectations?</span>
                <select
                  value={profile.batteryExpectation}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      batteryExpectation: e.target.value as AiMatchProfile["batteryExpectation"],
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <option value="all-day">All-day use</option>
                  <option value="heavy">Heavy use</option>
                  <option value="two-day">Two-day endurance</option>
                </select>
              </label>
              <div>
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">
                  Preferred brands?
                </span>
                <div className="flex flex-wrap gap-2">
                  {brandOptions.slice(0, 10).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBrand(b)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        profile.preferredBrands.includes(b)
                          ? "border-[var(--electric-cyan)]/50 bg-[var(--arena-blue)]/25 text-[var(--electric-cyan)]"
                          : "border-white/10 text-[var(--text-secondary)]"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-bold text-[var(--text-primary)]">
                Your Perfect Matches
              </p>
              <ol className="space-y-3">
                {matches.map(({ device, matchPercent }, i) => (
                  <li
                    key={device.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <span className="text-xs text-[var(--text-secondary)]">{i + 1}.</span>{" "}
                      <Link
                        href={`/phones/${device.slug}`}
                        className="font-semibold text-[var(--electric-cyan)] hover:underline"
                      >
                        {device.name}
                      </Link>
                      {device.price != null && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          {formatMoney(
                            profile.budgetCurrency === "INR"
                              ? usdToInr(device.price)
                              : device.price,
                            profile.budgetCurrency,
                          )}
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-extrabold text-[var(--premium-gold)]">
                      {matchPercent}%
                    </span>
                  </li>
                ))}
                {!matches.length && (
                  <li className="text-sm text-[var(--text-secondary)]">
                    No matches — try raising your budget or clearing brand filters.
                  </li>
                )}
              </ol>
            </div>
          </div>
        )}

        {tab === "assistant" && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
              🤖 AI Buying Assistant
            </p>
            <textarea
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
              rows={4}
              placeholder="I need: under ₹25K, best camera, good battery, minimal gaming"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--electric-cyan)]/40"
            />
            <p className="text-xs text-[var(--text-secondary)]">AI suggests:</p>
            <ul className="space-y-2">
              {assistant.suggestions.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/phones/${d.slug}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-[var(--electric-cyan)]/30"
                  >
                    <span className="font-semibold text-[var(--text-primary)]">{d.name}</span>
                    {d.price != null && (
                      <span className="text-sm text-[var(--premium-gold)]">
                        ${d.price.toLocaleString()}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
              {!assistant.suggestions.length && (
                <li className="text-sm text-[var(--text-secondary)]">
                  No matches — try broadening your requirements.
                </li>
              )}
            </ul>
          </div>
        )}

        {tab === "insights" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <InsightBlock title="Personalized Recommendations">
              <ul className="space-y-2 text-sm">
                {personalized.map(({ device, reasons }) => (
                  <li key={device.id} className="rounded-lg border border-white/5 px-3 py-2">
                    <Link
                      href={`/phones/${device.slug}`}
                      className="font-semibold text-[var(--electric-cyan)] hover:underline"
                    >
                      {device.name}
                    </Link>
                    <ul className="mt-1 text-[11px] text-[var(--text-secondary)]">
                      {reasons.map((r) => (
                        <li key={r}>• {REASON_LABELS[r]}</li>
                      ))}
                    </ul>
                  </li>
                ))}
                {!personalized.length && (
                  <li className="text-[var(--text-secondary)]">
                    Browse phones or add wishlist items for personalized picks.
                  </li>
                )}
              </ul>
            </InsightBlock>

            <InsightBlock title="Smart Comparison Suggestions">
              <label className="mb-2 block text-xs text-[var(--text-secondary)]">
                Anchor phone (name or slug)
              </label>
              <input
                value={compareAnchorSlug}
                onChange={(e) => onCompareAnchorChange(e.target.value)}
                placeholder="e.g. galaxy-s24"
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              {comparison.anchor ? (
                <>
                  <p className="text-xs text-[var(--text-secondary)]">
                    People comparing {comparison.anchor.name} also compare:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {comparison.alternatives.map((d) => (
                      <li key={d.id}>
                        •{" "}
                        <Link
                          href={`/phones/${d.slug}`}
                          className="text-[var(--electric-cyan)] hover:underline"
                        >
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  Enter a phone name to see comparison suggestions.
                </p>
              )}
            </InsightBlock>

            <InsightBlock title="Upgrade Advisor" icon={ArrowUpCircle}>
              <input
                value={upgradeQuery}
                onChange={(e) => onUpgradeQueryChange(e.target.value)}
                placeholder="Current phone e.g. Volt Stride Pro"
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              {upgrade.current ? (
                <>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Current: <strong>{upgrade.current.name}</strong>
                  </p>
                  <p className="mt-2 text-xs font-bold text-[var(--text-primary)]">
                    Recommended upgrades:
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {upgrade.upgrades.map((d) => (
                      <li key={d.id}>
                        •{" "}
                        <Link
                          href={`/phones/${d.slug}`}
                          className="text-[var(--electric-cyan)] hover:underline"
                        >
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  Search your current phone to get upgrade paths.
                </p>
              )}
            </InsightBlock>

            <InsightBlock title="Budget Optimizer">
              <p className="mb-2 text-xs text-[var(--text-secondary)]">
                Budget: {formatMoney(profile.budgetMax, profile.budgetCurrency)}
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)]">Suggested allocation:</p>
              <ul className="mt-2 space-y-2 text-sm">
                {budgetPicks.map(({ medal, device }) => (
                  <li key={device.id}>
                    {medal}{" "}
                    <Link
                      href={`/phones/${device.slug}`}
                      className="text-[var(--electric-cyan)] hover:underline"
                    >
                      {device.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </InsightBlock>

            <InsightBlock title="Daily Deal Recommendations" icon={TrendingDown}>
              <div className="space-y-2 text-sm">
                {deals.map(({ device, label, dropPercent }) => (
                  <div
                    key={`${device.id}-${label}`}
                    className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2"
                  >
                    <div>
                      <Link
                        href={`/phones/${device.slug}`}
                        className="font-semibold text-[var(--electric-cyan)] hover:underline"
                      >
                        {device.name}
                      </Link>
                      <p className="text-[10px] text-[var(--text-secondary)]">{label}</p>
                    </div>
                    {dropPercent != null && dropPercent > 0 && (
                      <span className="text-xs font-bold text-[var(--emerald-success)]">
                        −{dropPercent}%
                      </span>
                    )}
                  </div>
                ))}
                {!deals.length && (
                  <p className="text-[var(--text-secondary)]">No deals tracked today.</p>
                )}
              </div>
            </InsightBlock>
          </div>
        )}

        {tab === "voice" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
                🎙️ Voice Search
              </p>
              <button
                type="button"
                onClick={startVoice}
                disabled={voiceListening}
                className="arena-btn-primary flex items-center gap-2 text-sm"
              >
                <Mic size={16} />
                {voiceListening ? "Listening…" : "Start voice search"}
              </button>
              {voiceTranscript && (
                <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-secondary)]">
                  “{voiceTranscript}”
                </p>
              )}
              <p className="text-[11px] text-[var(--text-secondary)]">
                Try: “Show gaming phones under ₹30,000”, “Find the best camera phone”, “Compare
                Volt and Nimbus”, “Filter by 5G”, “Show latest launches”.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
                📷 Image-Based Search
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-8 text-center hover:border-[var(--electric-cyan)]/40">
                <Scan size={28} className="mb-2 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-primary)]">
                  Upload phone image, screenshot, or ad
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />
              </label>
              {imageResult && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  {imageResult.match ? (
                    <>
                      <p className="font-bold text-[var(--text-primary)]">
                        Identified: {imageResult.match.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Similar alternatives:
                      </p>
                      <ul className="mt-1 space-y-1">
                        {imageResult.alternatives.map((d) => (
                          <li key={d.id}>
                            <Link
                              href={`/phones/${d.slug}`}
                              className="text-[var(--electric-cyan)] hover:underline"
                            >
                              {d.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-[var(--text-secondary)]">
                      Could not identify device from “{imageResult.label}”. Try a clearer filename
                      or photo of the product name.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
                🌐 AR Device Preview
              </p>
              <div className="flex flex-wrap gap-2">
                {devices.slice(0, 6).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setArDevice(d)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:border-[var(--electric-cyan)]/40"
                  >
                    AR · {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {arDevice && (
        <ArPreviewModal device={arDevice} onClose={() => setArDevice(null)} />
      )}
    </GlassPanel>
  );
}

function InsightBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
        {Icon && <Icon size={16} className="text-[var(--electric-cyan)]" />}
        {title}
      </p>
      {children}
    </div>
  );
}
