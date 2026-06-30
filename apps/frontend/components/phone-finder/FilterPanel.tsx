"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";

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
import { GlassPanel } from "@/design-system/glass/GlassPanel";
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

export function PhoneFinderFilterPanel(props: Props) {
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

  return (
    <div className="space-y-4">
      <GlassPanel className="p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[var(--electric-cyan)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Filters</h2>
            {active > 0 && <Badge variant="cyan">{active} active</Badge>}
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_PHONE_FINDER_FILTERS })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--electric-cyan)]"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <p className="mb-4 text-xs text-[var(--text-secondary)]">
          {resultCount} of {totalCount} devices match
        </p>

        <FilterListSection title="Device">
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

        <FilterListSection title="Brands">
          <BrandFilter
            brands={brands}
            devices={devices}
            selected={filters.brand}
            onSelect={(brand) => patch({ brand })}
          />
        </FilterListSection>
        <FilterListSection title="Price">
          <div className="space-y-3">
            <FilterChoiceList
              options={PRICE_CURRENCY_OPTIONS}
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

        <FilterListSection title="Display">
          <StepSlider
            hideLabel
            blankDefault
            label="Display"
            placeholder="Choose display"
            options={DISPLAY_TECH_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.displayTech}
            onChange={(displayTech) =>
              patch({ displayTech: displayTech ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title="Processor">
          <StepSlider
            hideLabel
            blankDefault
            label="Processor"
            placeholder="Choose processor"
            options={PROCESSOR_BRAND_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.processorBrand}
            onChange={(processorBrand) =>
              patch({ processorBrand: processorBrand ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title="Camera">
          <MinRangeSlider
            label="Main Camera Resolution"
            min={0}
            max={300}
            step={1}
            value={filters.minCameraMp}
            onChange={(minCameraMp) => patch({ minCameraMp })}
            formatValue={(n) => `${n} MP`}
          />

          <MinRangeSlider
            label="Front Camera Resolution"
            min={0}
            max={200}
            step={1}
            value={filters.minSelfieMp}
            onChange={(minSelfieMp) => patch({ minSelfieMp })}
            formatValue={(n) => `${n} MP`}
          />

          <TriSlide
            label="Ultra-Wide Camera"
            value={filters.ultraWideCamera}
            onChange={(ultraWideCamera) => patch({ ultraWideCamera })}
          />

          <TriSlide
            label="Telephoto Camera"
            value={filters.telephotoCamera}
            onChange={(telephotoCamera) => patch({ telephotoCamera })}
          />

          <TriSlide
            label="Optical Zoom"
            value={filters.opticalZoom}
            onChange={(opticalZoom) => patch({ opticalZoom })}
          />

          <TriSlide
            label="OIS Support"
            value={filters.ois}
            onChange={(ois) => patch({ ois })}
          />

          <TriSlide
            label="4K Recording"
            value={filters.video4k}
            onChange={(video4k) => patch({ video4k })}
          />

          <TriSlide
            label="8K Recording"
            value={filters.video8k}
            onChange={(video8k) => patch({ video8k })}
          />
        </FilterListSection>

        <FilterListSection title="Battery Capacity">
          <StepSlider
            hideLabel
            label="Battery Capacity"
            options={BATTERY_BUCKET_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.batteryBucket}
            onChange={(batteryBucket) =>
              patch({ batteryBucket: batteryBucket ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title="Connectivity">
          <StepSlider
            label="Network"
            options={CELLULAR_NETWORK_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.cellularNetwork}
            onChange={(cellularNetwork) =>
              patch({ cellularNetwork: cellularNetwork ?? "All" })
            }
          />

          <StepSlider
            label="Wi-Fi Version"
            options={WIFI_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.wifiVersion}
            onChange={(wifiVersion) => patch({ wifiVersion: wifiVersion ?? "All" })}
          />

          <StepSlider
            label="Bluetooth Version"
            options={BLUETOOTH_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.bluetoothVersion}
            onChange={(bluetoothVersion) =>
              patch({ bluetoothVersion: bluetoothVersion ?? "All" })
            }
          />

          <TriSlide
            label="NFC"
            value={filters.nfc}
            onChange={(nfc) => patch({ nfc })}
          />

          <TriSlide
            label="IR Blaster"
            value={filters.infrared}
            onChange={(infrared) => patch({ infrared })}
          />

          <TriSlide
            label="eSIM Support"
            value={filters.esim}
            onChange={(esim) => patch({ esim })}
          />

          <StepSlider
            label="SIM Type"
            options={SIM_TYPE_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.simType}
            onChange={(simType) => patch({ simType: simType ?? "All" })}
          />
        </FilterListSection>

        <FilterListSection title="Security & Build">
          <StepSlider
            label="Fingerprint Type"
            options={FINGERPRINT_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.fingerprintType}
            onChange={(fingerprintType) =>
              patch({ fingerprintType: fingerprintType ?? "All" })
            }
          />

          <StepSlider
            label="IP Rating"
            options={IP_RATING_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.ipRating}
            onChange={(ipRating) => patch({ ipRating: ipRating ?? "All" })}
          />

          <StepSlider
            label="Build Material"
            options={BUILD_MATERIAL_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.buildMaterial}
            onChange={(buildMaterial) =>
              patch({ buildMaterial: buildMaterial ?? "All" })
            }
          />
        </FilterListSection>

        <FilterListSection title="Operating System">
          <StepSlider
            hideLabel
            label="Operating System"
            options={OS_FAMILY_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={filters.osFamily}
            onChange={(osFamily) => patch({ osFamily: osFamily ?? "All" })}
          />
        </FilterListSection>

        <FilterListSection title="Gaming & AI">
          <FilterListItem label="Gaming Features">
            <ul className="space-y-2" role="list">
              <li>
                <SlideToggle
                  label="Shoulder Triggers"
                  active={filters.gamingShoulderTriggers === true}
                  onChange={(on) => patch(boolToggle("gamingShoulderTriggers", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label="Cooling Fan"
                  active={filters.gamingCoolingFan === true}
                  onChange={(on) => patch(boolToggle("gamingCoolingFan", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label="High Touch Sampling Rate"
                  active={filters.highTouchSampling === true}
                  onChange={(on) => patch(boolToggle("highTouchSampling", on))}
                />
              </li>
            </ul>
          </FilterListItem>

          <FilterListItem label="AI Features">
            <ul className="space-y-2" role="list">
              <li>
                <SlideToggle
                  label="AI Photography"
                  active={filters.aiPhotography === true}
                  onChange={(on) => patch(boolToggle("aiPhotography", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label="AI Translation"
                  active={filters.aiTranslation === true}
                  onChange={(on) => patch(boolToggle("aiTranslation", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label="AI Call Summary"
                  active={filters.aiCallSummary === true}
                  onChange={(on) => patch(boolToggle("aiCallSummary", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label="Circle to Search"
                  active={filters.circleToSearch === true}
                  onChange={(on) => patch(boolToggle("circleToSearch", on))}
                />
              </li>
              <li>
                <SlideToggle
                  label="On-device AI Models"
                  active={filters.onDeviceAi === true}
                  onChange={(on) => patch(boolToggle("onDeviceAi", on))}
                />
              </li>
            </ul>
          </FilterListItem>
        </FilterListSection>
      </GlassPanel>
    </div>
  );
}
