import { PrismaClient } from "@prisma/client";

import { seedBrands } from "./seeds/brands";
import { seedCategories } from "./seeds/categories";
import { seedManufacturers } from "./seeds/manufacturers";
import { seedDevices } from "./seeds/devices";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MobileArena Seed...");

  await seedBrands(prisma);
  await seedCategories(prisma);
  await seedManufacturers(prisma);
  await seedDevices(prisma);

  console.log("✅ MobileArena Seed Complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });