import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/common/slug";

const brands: { name: string }[] =
  require("../data/brands.json");

export async function seedBrands(prisma: PrismaClient) {
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: { name: brand.name },
      create: { name: brand.name, slug: slugify(brand.name) },
    });
  }
}
