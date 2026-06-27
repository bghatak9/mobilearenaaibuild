import type { Device } from "@/lib/api";

type Row = { label: string; value: string | null | undefined };
type Section = { title: string; rows: Row[] };

function yesNo(value: boolean | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value ? "Yes" : "No";
}

export default function SpecsTable({ device }: { device: Device }) {
  const mainCamera = device.cameras?.length
    ? Math.max(...device.cameras.map((c) => c.megapixel))
    : null;

  const sections: Section[] = [
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
    <div className="space-y-6">
      {sections
        .map((s) => ({
          ...s,
          rows: s.rows.filter((r) => r.value != null && r.value !== ""),
        }))
        .filter((s) => s.rows.length > 0)
        .map((section) => (
          <div
            key={section.title}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
          >
            <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-900">
              {section.title}
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100 last:border-0">
                    <td className="w-1/3 px-4 py-3 font-medium text-gray-500">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
