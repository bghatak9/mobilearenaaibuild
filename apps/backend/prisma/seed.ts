import { PrismaClient } from "@prisma/client";

import { seedBrands } from "./seeds/brands";
import { seedCategories } from "./seeds/categories";
import { seedManufacturers } from "./seeds/manufacturers";
import { seedDevices } from "./seeds/devices";
import { seedUsers } from "./seeds/users";
import { seedBadges } from "./seeds/badges";
import { seedBrandTranslations } from "./seeds/brand-translations";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MobileArena Seed...");

  await seedUsers(prisma);
  await seedBadges(prisma);
  await seedBrands(prisma);
  await seedCategories(prisma);
  await seedManufacturers(prisma);

  if (process.env.SKIP_DEVICE_SEED === "true") {
    console.log("⏭️  Skipping device seed (SKIP_DEVICE_SEED=true)");
  } else {
    await seedDevices(prisma);
  }

  if (process.env.SKIP_BRAND_TRANSLATIONS !== "true") {
    await seedBrandTranslations(prisma);
  }

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