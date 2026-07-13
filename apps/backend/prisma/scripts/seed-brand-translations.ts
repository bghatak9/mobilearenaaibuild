import { PrismaClient } from "@prisma/client";

import { seedBrandTranslations } from "../seeds/brand-translations";

const prisma = new PrismaClient();

seedBrandTranslations(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
