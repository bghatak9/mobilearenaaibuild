"use client";

import { useMemo } from "react";

import {
  ChooseableFilterPicker,
} from "@/components/phone-finder/FilterOptionPicker";
import { buildBrandPickerOptions } from "@/lib/brand-categories";
import type { Device } from "@/lib/api";

type BrandFilterProps = {
  brands: string[];
  devices?: Device[];
  selected: string;
  onSelect: (brand: string) => void;
};

export default function BrandFilter({
  brands,
  devices = [],
  selected,
  onSelect,
}: BrandFilterProps) {
  const options = useMemo(
    () => buildBrandPickerOptions(devices, brands),
    [devices, brands],
  );

  return (
    <ChooseableFilterPicker
      hideLabel
      blankDefault
      label="Brands"
      options={options}
      value={selected}
      onChange={onSelect}
      placeholder="Choose brands"
      searchPlaceholder="Search brands…"
    />
  );
}
