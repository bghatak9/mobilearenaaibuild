"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { PhoneFinderSearch } from "@/components/phone-finder/PhoneFinderSearch";
import BrandFilter from "@/components/filters/BrandFilter";
import {
  FilterChoiceList,
  FilterListItem,
  FilterListSection,
} from "@/components/phone-finder/FilterListUi";
import {
  DualRangeSlider,
  MinRangeSlider,
  SlideToggle,
  StepSlider,
  TriSlide,
} from "@/components/phone-finder/FilterSliders";
import { Badge } from "@/design-system/badges/Badge";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import {
  BATTERY_BUCKET_OPTIONS,
  BLUETOOTH_OPTIONS,
  BUILD_MATERIAL_OPTIONS,
  CELLULAR_NETWORK_OPTIONS,
  DISPLAY_TECH_OPTIONS,
  FINGERPRINT_OPTIONS,
  IP_RATING_OPTIONS,
  OS_FAMILY_OPTIONS,
  PROCESSOR_BRAND_OPTIONS,
  SIM_TYPE_OPTIONS,
  WIFI_OPTIONS,
  countActiveFilters,
  DEFAULT_PHONE_FINDER_FILTERS,
  formatPriceAmount,
  PRICE_CURRENCY_OPTIONS,
  type CatalogFilterOption,
  type PhoneFinderFilters,
} from "@/features/phone-finder";
import type { Device } from "@/lib/api";

type Props = {
  filters: PhoneFinderFilters;
  onChange: (next: PhoneFinderFilters) => void;
  searchValue: string;
  devices: Device[];
  brands: string[];
  onSearchChange: (query: string) => void;
  onSearchCommit: (query: string) => void;
  onApplySuggestion: (
    query: string,
    patch?: Partial<PhoneFinderFilters>,
  ) => void;
  onSearchFocusChange?: (focused: boolean) => void;
  priceMin: number;
  priceMax: number;
  priceCurrency: PhoneFinderFilters["priceCurrency"];
  priceStep: number;
  resultCount: number;
  totalCount: number;
};

function boolToggle(
  key: keyof PhoneFinderFilters,
  on: boolean,
): Partial<PhoneFinderFilters> {
  return { [key]: on ? true : null } as Partial<PhoneFinderFilters>;
}

function translateOptions(
  options: CatalogFilterOption[],
  t: (key: string) => string,
) {
  return options.map((opt) => ({
    label: t(opt.labelKey),
    value: opt.value,
  }));
}

export function PhoneFinderFilterPanel(props: Props) {
  const t = useTranslations("finder");
  const {
    filters,
    onChange,
    searchValue,
    devices,
    brands,
    onSearchChange,
    onSearchCommit,
    onApplySuggestion,
    onSearchFocusChange,
    priceMin,
    priceMax,
    priceCurrency,
    priceStep,
    resultCount,
    totalCount,
  } = props;

  const active = countActiveFilters(filters);

  function patch(partial: Partial<PhoneFinderFilters>) {
    onChange({ ...filters, ...partial, preset: null });
  }

  const currencyOptions = PRICE_CURRENCY_OPTIONS.map((opt) => ({
    label:
      opt.value === "USD"
        ? t("filters.currencyUsd")
        : t("filters.currencyInr"),
    value: opt.value,
  }));

  return (
    <div className="space-y-4">
      <SpectrumPanel className="min-w-0 overflow-hidden p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <SlidersHorizontal size={18} className="text-[var(--electric-cyan)]" />
            <h2 className="font-bold text-[var(--text-primary)]">
              {t("filters.title")}
            </h2>
            {active > 0 && (
              <Badge variant="cyan">
                {t("filters.activeCount", { count: active })}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_PHONE_FINDER_FILTERS })}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--electric-cyan)]"
          >
            <RotateCcw size={14} />
            {t("filters.reset")}
          </button>
        </div>

        <p className="mb-4 text-xs text-[var(--text-secondary)]">
          {t("filters.matchDevices", { resultCount, totalCount })}
        </p>

        <FilterListSection title={t("filters.device")}>
          <PhoneFinderSearch
            layout="sidebar"
            value={searchValue}
            devices={devices}
            brands={brands}
            filters={filters}
            onChange={onSearchChange}
            onCommit={onSearchCommit}
            onApplySuggestion={onApplySuggestion}
            onFocusChange={onSearchFocusChange}
          />
        </FilterListSection>

        <FilterListSection title={t("filters.brands")}>
          <BrandFilter
            variant="select"
            brands={brands}
            devices={devices}
            selected={filters.brand}
            onSelect={(brand) => patch({ brand })}
          />
        </FilterListSection>
        <FilterListSection title={t("filters.price")}>
          <div className="space-y-3">
            <FilterChoiceList
              options={currencyOptions}
              value={filters.priceCurrency}
              onChange={(nextCurrency) =>
                patch({
                  priceCurrency: nextCurrency as PhoneFinderFilters["priceCurrency"],
                  minPrice: null,
                  maxPrice: null,
                })
              }
              includeAll={false}
            />
            <DualRangeSlider
              min={priceMin}
              max={priceMax}
              step={priceStep}
              minValue={filters.minPrice}
              maxValue={filters.maxPrice}
              onChange={(minPrice, maxPrice) => patch({ minPrice, maxPrice })}
              formatValue={(n) => formatPriceAmount(n, priceCurrency)}
            />
          </div>
        </FilterListSection>

        <FilterListSection title={t("filters.display")}>
          <StepSlider
            hideLabel
            blankDefault
            label={t("filters.display")}
            placeholder={t("filters.chooseDisplay")}
            options={translateOptions(DISPLAY_TECH_OPTIONS, t)}
            value={filters.displayTech}
            onChange={(displayTech) =>
              patch({ displayTech: displayTech ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title={t("filters.processor")}>
          <StepSlider
            hideLabel
            blankDefault
            label={t("filters.processor")}
            placeholder={t("filters.chooseProcessor")}
            options={translateOptions(PROCESSOR_BRAND_OPTIONS, t)}
            value={filters.processorBrand}
            onChange={(processorBrand) =>
              patch({ processorBrand: processorBrand ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title={t("filters.camera")}>
          <MinRangeSlider
            label={t("filters.mainCameraMp")}
            min={0}
            max={300}
            step={1}
            value={filters.minCameraMp}
            onChange={(minCameraMp) => patch({ minCameraMp })}
            formatValue={(n) => `${n} MP`}
          />

          <MinRangeSlider
            label={t("filters.frontCameraMp")}
            min={0}
            max={200}
            step={1}
            value={filters.minSelfieMp}
            onChange={(minSelfieMp) => patch({ minSelfieMp })}
            formatValue={(n) => `${n} MP`}
          />

          <TriSlide
            label={t("filters.ultraWide")}
            value={filters.ultraWideCamera}
            onChange={(ultraWideCamera) => patch({ ultraWideCamera })}
          />

          <TriSlide
            label={t("filters.telephoto")}
            value={filters.telephotoCamera}
            onChange={(telephotoCamera) => patch({ telephotoCamera })}
          />

          <TriSlide
            label={t("filters.opticalZoom")}
            value={filters.opticalZoom}
            onChange={(opticalZoom) => patch({ opticalZoom })}
          />

          <TriSlide
            label={t("filters.ois")}
            value={filters.ois}
            onChange={(ois) => patch({ ois })}
          />

          <TriSlide
            label={t("filters.video4k")}
            value={filters.video4k}
            onChange={(video4k) => patch({ video4k })}
          />

          <TriSlide
            label={t("filters.video8k")}
            value={filters.video8k}
            onChange={(video8k) => patch({ video8k })}
          />
        </FilterListSection>

        <FilterListSection title={t("filters.batteryCapacity")}>
          <StepSlider
            hideLabel
            label={t("filters.batteryCapacity")}
            options={translateOptions(BATTERY_BUCKET_OPTIONS, t)}
            value={filters.batteryBucket}
            onChange={(batteryBucket) =>
              patch({ batteryBucket: batteryBucket ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title={t("filters.connectivity")}>
          <StepSlider
            label={t("filters.network")}
            options={translateOptions(CELLULAR_NETWORK_OPTIONS, t)}
            value={filters.cellularNetwork}
            onChange={(cellularNetwork) =>
              patch({ cellularNetwork: cellularNetwork ?? "All" })
            }
          />

          <StepSlider
            label={t("filters.wifiVersion")}
            options={translateOptions(WIFI_OPTIONS, t)}
            value={filters.wifiVersion}
            onChange={(wifiVersion) => patch({ wifiVersion: wifiVersion ?? "All" })}
          />

          <StepSlider
            label={t("filters.bluetoothVersion")}
            options={translateOptions(BLUETOOTH_OPTIONS, t)}
            value={filters.bluetoothVersion}
            onChange={(bluetoothVersion) =>
              patch({ bluetoothVersion: bluetoothVersion ?? "All" })
            }
          />

          <TriSlide
            label={t("filters.nfc")}
            value={filters.nfc}
            onChange={(nfc) => patch({ nfc })}
          />

          <TriSlide
            label={t("filters.irBlaster")}
            value={filters.infrared}
            onChange={(infrared) => patch({ infrared })}
          />

          <TriSlide
            label={t("filters.esimSupport")}
            value={filters.esim}
            onChange={(esim) => patch({ esim })}
          />

          <StepSlider
            label={t("filters.simType")}
            options={translateOptions(SIM_TYPE_OPTIONS, t)}
            value={filters.simType}
            onChange={(simType) => patch({ simType: simType ?? "All" })}
          />
        </FilterListSection>

        <FilterListSection title={t("filters.securityBuild")}>
          <StepSlider
            label={t("filters.fingerprintType")}
            options={translateOptions(FINGERPRINT_OPTIONS, t)}
            value={filters.fingerprintType}
            onChange={(fingerprintType) =>
              patch({ fingerprintType: fingerprintType ?? "All" })
            }
          />

          <StepSlider
            label={t("filters.ipRating")}
            options={translateOptions(IP_RATING_OPTIONS, t)}
            value={filters.ipRating}
            onChange={(ipRating) => patch({ ipRating: ipRating ?? "All" })}
          />

          <StepSlider
            label={t("filters.buildMaterial")}
            options={translateOptions(BUILD_MATERIAL_OPTIONS, t)}
            value={filters.buildMaterial}
            onChange={(buildMaterial) =>
              patch({ buildMaterial: buildMaterial ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title={t("filters.operatingSystem")}>
          <StepSlider
            hideLabel
            label={t("filters.operatingSystem")}
            options={translateOptions(OS_FAMILY_OPTIONS, t)}
            value={filters.osFamily}
            onChange={(osFamily) => patch({ osFamily: osFamily ?? "All" })}
          />
        </FilterListSection>

        <FilterListSection title={t("filters.gamingAi")}>
          <FilterListItem label={t("filters.gamingFeatures")}>
            <ul className="space-y-2" role="list">
              <li>
                <SlideToggle
                  label={t("filters.shoulderTriggers")}
                  active={filters.gamingShoulderTriggers === true}
                  onChange={(on) => patch(boolToggle("gamingShoulderTriggers", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label={t("filters.coolingFan")}
                  active={filters.gamingCoolingFan === true}
                  onChange={(on) => patch(boolToggle("gamingCoolingFan", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label={t("filters.highTouchSampling")}
                  active={filters.highTouchSampling === true}
                  onChange={(on) => patch(boolToggle("highTouchSampling", on))}
                />
              </li>
            </ul>
          </FilterListItem>

          <FilterListItem label={t("filters.aiFeatures")}>
            <ul className="space-y-2" role="list">
              <li>
                <SlideToggle
                  label={t("filters.aiPhotography")}
                  active={filters.aiPhotography === true}
                  onChange={(on) => patch(boolToggle("aiPhotography", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label={t("filters.aiTranslation")}
                  active={filters.aiTranslation === true}
                  onChange={(on) => patch(boolToggle("aiTranslation", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label={t("filters.aiCallSummary")}
                  active={filters.aiCallSummary === true}
                  onChange={(on) => patch(boolToggle("aiCallSummary", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label={t("filters.circleToSearch")}
                  active={filters.circleToSearch === true}
                  onChange={(on) => patch(boolToggle("circleToSearch", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label={t("filters.onDeviceAi")}
                  active={filters.onDeviceAi === true}
                  onChange={(on) => patch(boolToggle("onDeviceAi", on))}
                />
              </li>
            </ul>
          </FilterListItem>
        </FilterListSection>
      </SpectrumPanel>
    </div>
  );
}
