import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/common/slug";

type DemoDevice = {
  name: string;
  brand: string;
  manufacturer: string;
  category: string;
  price: number;
  weight: number;
  os: string;
  fiveG: boolean;
  nfc: boolean;
  display: {
    type: string;
    size: number;
    resolution: string;
    refreshRate: number;
    brightness: number;
    protection: string;
  };
  battery: {
    capacity: number;
    charging: string;
    wireless: boolean;
    reverse: boolean;
  };
  chipset: {
    cpu: string;
    gpu: string;
    fabrication: string;
    benchmark: number;
  };
  cameras: { type: string; megapixel: number; aperture?: string }[];
};

/** Fictional MobileArena catalog devices — original names and illustrative specs only. */
const devices: DemoDevice[] = [
  {
    name: "Volt Stride Pro",
    brand: "Volt Mobile",
    manufacturer: "Volt Mobile",
    category: "Flagship",
    price: 999,
    weight: 168,
    os: "ArenaOS 15",
    fiveG: true,
    nfc: true,
    display: {
      type: "Aurora AMOLED",
      size: 6.2,
      resolution: "2400x1080",
      refreshRate: 120,
      brightness: 2550,
      protection: "Arena Shield Glass",
    },
    battery: { capacity: 4100, charging: "45W", wireless: true, reverse: true },
    chipset: {
      cpu: "Volt X3 Prime",
      gpu: "Volt Graph 750",
      fabrication: "4nm",
      benchmark: 1680000,
    },
    cameras: [
      { type: "Main", megapixel: 50, aperture: "f/1.7" },
      { type: "Ultrawide", megapixel: 12, aperture: "f/2.1" },
      { type: "Telephoto", megapixel: 10, aperture: "f/2.5" },
    ],
  },
  {
    name: "Nimbus Arc Ultra",
    brand: "Nimbus Tech",
    manufacturer: "Nimbus Tech",
    category: "Flagship",
    price: 1099,
    weight: 174,
    os: "ArenaOS 15",
    fiveG: true,
    nfc: true,
    display: {
      type: "CloudPeak OLED",
      size: 6.1,
      resolution: "2560x1180",
      refreshRate: 120,
      brightness: 2100,
      protection: "Nimbus Ceramic Shield",
    },
    battery: { capacity: 3400, charging: "35W", wireless: true, reverse: false },
    chipset: {
      cpu: "Nimbus Astra M2",
      gpu: "Nimbus Core GPU",
      fabrication: "4nm",
      benchmark: 1420000,
    },
    cameras: [
      { type: "Main", megapixel: 48, aperture: "f/1.6" },
      { type: "Ultrawide", megapixel: 12, aperture: "f/2.3" },
    ],
  },
  {
    name: "Orbit Prism Mini",
    brand: "Orbit Devices",
    manufacturer: "Orbit Devices",
    category: "Compact",
    price: 799,
    weight: 192,
    os: "ArenaOS 15",
    fiveG: true,
    nfc: true,
    display: {
      type: "Orbit Actua Panel",
      size: 6.3,
      resolution: "2440x1088",
      refreshRate: 120,
      brightness: 2650,
      protection: "Arena Shield Glass",
    },
    battery: { capacity: 4600, charging: "40W", wireless: true, reverse: true },
    chipset: {
      cpu: "Orbit Tensor Q4",
      gpu: "Orbit Mali Wave",
      fabrication: "4nm",
      benchmark: 1180000,
    },
    cameras: [
      { type: "Main", megapixel: 50, aperture: "f/1.7" },
      { type: "Ultrawide", megapixel: 48, aperture: "f/1.8" },
    ],
  },
  {
    name: "Prism Horizon",
    brand: "Prism Labs",
    manufacturer: "Prism Labs",
    category: "Performance",
    price: 849,
    weight: 214,
    os: "ArenaOS 15",
    fiveG: true,
    nfc: true,
    display: {
      type: "Prism LTPO AMOLED",
      size: 6.8,
      resolution: "3200x1440",
      refreshRate: 120,
      brightness: 4300,
      protection: "Prism Guard Glass",
    },
    battery: { capacity: 5200, charging: "80W", wireless: true, reverse: true },
    chipset: {
      cpu: "Prism Pulse X3",
      gpu: "Prism Graph 750",
      fabrication: "4nm",
      benchmark: 2050000,
    },
    cameras: [
      { type: "Main", megapixel: 50, aperture: "f/1.6" },
      { type: "Ultrawide", megapixel: 48, aperture: "f/2.2" },
      { type: "Telephoto", megapixel: 64, aperture: "f/2.7" },
    ],
  },
];

async function ensureRef(
  prisma: PrismaClient,
  model: "brand" | "manufacturer" | "category",
  name: string,
): Promise<number> {
  const slug = slugify(name);
  const record = await (prisma[model] as any).upsert({
    where: { name },
    update: {},
    create: { name, slug },
  });
  return record.id;
}

async function main() {
  const prisma = new PrismaClient();
  console.log("🌱 Seeding demo devices with full specs...");

  try {
    for (const d of devices) {
      const [brandId, manufacturerId, categoryId] = await Promise.all([
        ensureRef(prisma, "brand", d.brand),
        ensureRef(prisma, "manufacturer", d.manufacturer),
        ensureRef(prisma, "category", d.category),
      ]);

      const slug = slugify(d.name);
      const scalars = {
        name: d.name,
        price: d.price,
        weight: d.weight,
        os: d.os,
        fiveG: d.fiveG,
        nfc: d.nfc,
        brandId,
        manufacturerId,
        categoryId,
      };

      const device = await prisma.device.upsert({
        where: { slug },
        update: scalars,
        create: { slug, ...scalars },
      });

      await prisma.display.upsert({
        where: { deviceId: device.id },
        update: d.display,
        create: { ...d.display, deviceId: device.id },
      });

      await prisma.battery.upsert({
        where: { deviceId: device.id },
        update: d.battery,
        create: { ...d.battery, deviceId: device.id },
      });

      await prisma.chipset.upsert({
        where: { deviceId: device.id },
        update: d.chipset,
        create: { ...d.chipset, deviceId: device.id },
      });

      await prisma.camera.deleteMany({ where: { deviceId: device.id } });
      await prisma.camera.createMany({
        data: d.cameras.map((c) => ({
          ...c,
          stabilization: c.type !== "Ultrawide",
          deviceId: device.id,
        })),
      });

      console.log(`  ✓ ${d.name} (${slug})`);
    }

    console.log("✅ Demo seed complete");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
