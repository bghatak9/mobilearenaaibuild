import type { Device } from "@/lib/api";
import { SpecTable, type SpecSection } from "@mobilearena/ui";

function yesNo(value: boolean | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value ? "Yes" : "No";
}

export default function SpecsTable({ device }: { device: Device }) {
  const mainCamera = device.cameras?.length
    ? Math.max(...device.cameras.map((c) => c.megapixel))
    : null;

  const sections: SpecSection[] = [
    {
      title: "General",
      rows: [
        { label: "Brand", value: device.brand?.name },
        { label: "Category", value: device.category?.name },
        { label: "Manufacturer", value: device.manufacturer?.name },
        { label: "OS", value: device.os },
        {
          label: "Price",
          value: device.price != null ? `$${device.price}` : null,
        },
        {
          label: "Weight",
          value: device.weight != null ? `${device.weight} g` : null,
        },
        { label: "Dimensions", value: device.dimensions },
      ],
    },
    {
      title: "Display",
      rows: device.display
        ? [
            { label: "Type", value: device.display.type },
            { label: "Size", value: `${device.display.size}"` },
            { label: "Resolution", value: device.display.resolution },
            {
              label: "Refresh rate",
              value: `${device.display.refreshRate} Hz`,
            },
            { label: "Brightness", value: `${device.display.brightness} nits` },
            { label: "Protection", value: device.display.protection },
          ]
        : [],
    },
    {
      title: "Performance",
      rows: device.chipset
        ? [
            { label: "CPU", value: device.chipset.cpu },
            { label: "GPU", value: device.chipset.gpu },
            { label: "Fabrication", value: device.chipset.fabrication },
            {
              label: "Benchmark",
              value:
                device.chipset.benchmark != null
                  ? String(device.chipset.benchmark)
                  : null,
            },
          ]
        : [],
    },
    {
      title: "Camera",
      rows: [
        {
          label: "Main camera",
          value: mainCamera != null ? `${mainCamera} MP` : null,
        },
        {
          label: "Setup",
          value:
            device.cameras && device.cameras.length
              ? device.cameras
                  .map((c) => `${c.megapixel}MP ${c.type}`)
                  .join(", ")
              : null,
        },
      ],
    },
    {
      title: "Battery",
      rows: device.battery
        ? [
            { label: "Capacity", value: `${device.battery.capacity} mAh` },
            { label: "Charging", value: device.battery.charging },
            { label: "Wireless", value: yesNo(device.battery.wireless) },
            { label: "Reverse charging", value: yesNo(device.battery.reverse) },
          ]
        : [],
    },
    {
      title: "Connectivity & Sensors",
      rows: [
        { label: "5G", value: yesNo(device.fiveG) },
        { label: "NFC", value: yesNo(device.nfc) },
        { label: "Infrared", value: yesNo(device.infrared) },
        { label: "Water resistance", value: yesNo(device.waterproof) },
        { label: "Fingerprint", value: device.fingerprint },
      ],
    },
  ];

  return (
    <SpecTable
      sections={sections}
      categorySlug={device.category?.slug ?? device.category?.name}
    />
  );
}
