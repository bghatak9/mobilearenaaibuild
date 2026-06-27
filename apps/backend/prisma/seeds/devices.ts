import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/common/slug";

const devices: {
  name: string;
  price?: number;
  brand: string;
  category: string;
  manufacturer: string;
}[] = require("../data/devices.json");

export async function seedDevices(prisma: PrismaClient) {
  for (const device of devices) {
    const brand = await prisma.brand.findUnique({
      where: { name: device.brand },
    });

    const category = await prisma.category.findUnique({
      where: { name: device.category },
    });

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { name: device.manufacturer },
    });

    if (!brand || !category || !manufacturer) {
      console.warn(`Skipping ${device.name} - missing relation`);
      continue;
    }

    await prisma.device.create({
      data: {
        name: device.name,
        slug: slugify(device.name),
        price: device.price ?? null,
        brandId: brand.id,
        categoryId: category.id,
        manufacturerId: manufacturer.id,
      },
    });
  }
}