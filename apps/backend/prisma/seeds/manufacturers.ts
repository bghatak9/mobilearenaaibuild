import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/common/slug";

const manufacturers: { name: string }[] =
  require("../data/manufacturers.json");

export async function seedManufacturers(prisma: PrismaClient) {
  for (const manufacturer of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: manufacturer.name },
      update: { name: manufacturer.name },
      create: { name: manufacturer.name, slug: slugify(manufacturer.name) },
    });
  }
}
