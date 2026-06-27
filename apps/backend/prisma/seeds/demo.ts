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

const devices: DemoDevice[] = [
  {
    name: "Galaxy S24",
    brand: "Samsung",
    manufacturer: "Samsung",
    category: "Flagship",
    price: 999,
    weight: 167,
    os: "Android 14",
    fiveG: true,
    nfc: true,
    display: {
      type: "Dynamic AMOLED 2X",
      size: 6.2,
      resolution: "2340x1080",
      refreshRate: 120,
      brightness: 2600,
      protection: "Gorilla Glass Victus 2",
    },
    battery: { capacity: 4000, charging: "25W", wireless: true, reverse: true },
    chipset: {
      cpu: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      fabrication: "4nm",
      benchmark: 1700000,
    },
    cameras: [
      { type: "Main", megapixel: 50, aperture: "f/1.8" },
      { type: "Ultrawide", megapixel: 12, aperture: "f/2.2" },
      { type: "Telephoto", megapixel: 10, aperture: "f/2.4" },
    ],
  },
  {
    name: "iPhone 15",
    brand: "Apple",
    manufacturer: "Apple",
    category: "Flagship",
    price: 1099,
    weight: 171,
    os: "iOS 17",
    fiveG: true,
    nfc: true,
    display: {
      type: "Super Retina XDR OLED",
      size: 6.1,
      resolution: "2556x1179",
      refreshRate: 60,
      brightness: 2000,
      protection: "Ceramic Shield",
    },
    battery: { capacity: 3349, charging: "20W", wireless: true, reverse: false },
    chipset: {
      cpu: "Apple A16 Bionic",
      gpu: "Apple 5-core GPU",
      fabrication: "4nm",
      benchmark: 1450000,
    },
    cameras: [
      { type: "Main", megapixel: 48, aperture: "f/1.6" },
      { type: "Ultrawide", megapixel: 12, aperture: "f/2.4" },
    ],
  },
  {
    name: "Pixel 9",
    brand: "Google",
    manufacturer: "Google",
    category: "Flagship",
    price: 799,
    weight: 198,
    os: "Android 14",
    fiveG: true,
    nfc: true,
    display: {
      type: "Actua OLED",
      size: 6.3,
      resolution: "2424x1080",
      refreshRate: 120,
      brightness: 2700,
      protection: "Gorilla Glass Victus 2",
    },
    battery: { capacity: 4700, charging: "27W", wireless: true, reverse: true },
    chipset: {
      cpu: "Google Tensor G4",
      gpu: "Mali-G715",
      fabrication: "4nm",
      benchmark: 1150000,
    },
    cameras: [
      { type: "Main", megapixel: 50, aperture: "f/1.68" },
      { type: "Ultrawide", megapixel: 48, aperture: "f/1.7" },
    ],
  },
  {
    name: "OnePlus 12",
    brand: "OnePlus",
    manufacturer: "OnePlus",
    category: "Flagship",
    price: 799,
    weight: 220,
    os: "Android 14",
    fiveG: true,
    nfc: true,
    display: {
      type: "LTPO AMOLED",
      size: 6.82,
      resolution: "3168x1440",
      refreshRate: 120,
      brightness: 4500,
      protection: "Gorilla Glass Victus 2",
    },
    battery: { capacity: 5400, charging: "100W", wireless: true, reverse: true },
    chipset: {
      cpu: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      fabrication: "4nm",
      benchmark: 2100000,
    },
    cameras: [
      { type: "Main", megapixel: 50, aperture: "f/1.6" },
      { type: "Ultrawide", megapixel: 48, aperture: "f/2.2" },
      { type: "Telephoto", megapixel: 64, aperture: "f/2.6" },
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
