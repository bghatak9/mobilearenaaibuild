"use client";

import { useMemo } from "react";

import { BrandName } from "@/components/brands/BrandName";
import { ChooseableFilterPicker } from "@/components/phone-finder/FilterOptionPicker";
import { localizeBrandName } from "@/features/i18n";
import { buildBrandPickerOptions } from "@/lib/brand-categories";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";
import { useSiteLanguage } from "@/lib/site-language";

type BrandFilterProps = {
  brands: string[];
  devices?: Device[];
  selected: string;
  onSelect: (brand: string) => void;
  /** `list` — all brands visible (/phones). `select` — dropdown picker (phone finder). */
  variant?: "list" | "select";
};

export default function BrandFilter({
  brands,
  devices = [],
  selected,
  onSelect,
  variant = "list",
}: BrandFilterProps) {
  const { t, resolved } = useSiteLanguage();
  const options = useMemo(() => {
    const built = buildBrandPickerOptions(devices, brands);
    return built.map((opt) => {
      if (opt.value === "All") {
        return { ...opt, label: t("phones.allBrands") };
      }
      return { ...opt, label: localizeBrandName(opt.value, resolved) };
    });
  }, [devices, brands, t, resolved]);

  if (variant === "select") {
    return (
      <ChooseableFilterPicker
        hideLabel
        blankDefault
        preserveLabels
        label={t("phones.brands")}
        options={options.map(({ label, value }) => ({ label, value }))}
        value={selected}
        onChange={onSelect}
        placeholder={t("phones.brands")}
        searchPlaceholder={t("phones.search")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2" aria-label={t("phones.brands")}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              "w-full rounded-2xl border px-3 py-2.5 text-left text-sm font-bold tracking-tight transition",
              active
                ? "border-[var(--electric-cyan)]/60 bg-[var(--arena-blue)]/20 text-[var(--electric-cyan)]"
                : "border-white/10 bg-white/[0.04] text-[var(--text-primary)] hover:border-white/20",
            )}
          >
            {opt.value === "All" ? (
              <span className="arena-brand-name notranslate" translate="no">
                {opt.label}
              </span>
            ) : (
              <BrandName name={opt.value} />
            )}
          </button>
        );
      })}
    </div>
  );
}
