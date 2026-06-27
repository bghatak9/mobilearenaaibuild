import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/common/slug";

const categories: { name: string }[] =
  require("../data/categories.json");

export async function seedCategories(prisma: PrismaClient) {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { name: category.name },
      create: { name: category.name, slug: slugify(category.name) },
    });
  }
}
