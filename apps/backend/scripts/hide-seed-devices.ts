/**
 * Soft-delete every device that was not created via bulk upload.
 * Run once when testing with only your uploaded catalog:
 *
 *   CATALOG_IMPORTED_ONLY=true npm run catalog:hide-seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const [deviceResult, brandResult] = await Promise.all([
    prisma.device.updateMany({
      where: {
        deletedAt: null,
        importBatchId: null,
      },
      data: { deletedAt: now },
    }),
    prisma.brand.updateMany({
      where: {
        deletedAt: null,
        importBatchItems: { none: {} },
      },
      data: { deletedAt: now },
    }),
  ]);

  console.log(
    `Hidden ${deviceResult.count} seed/demo device(s). Imported devices are unchanged.`,
  );
  console.log(
    `Hidden ${brandResult.count} seed/demo brand(s). Uploaded brands are unchanged.`,
  );
  console.log(
    'Tip: set CATALOG_IMPORTED_ONLY=true in apps/backend/.env so the API never exposes seed data.',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
