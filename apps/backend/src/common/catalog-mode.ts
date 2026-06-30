import { Prisma } from '@prisma/client';

/** When true, public catalog APIs only return devices from successful imports. */
export function isImportedOnlyCatalog(): boolean {
  return process.env.CATALOG_IMPORTED_ONLY === 'true';
}

export function catalogDeviceWhere(
  extra?: Prisma.DeviceWhereInput,
): Prisma.DeviceWhereInput {
  const active: Prisma.DeviceWhereInput = {
    deletedAt: null,
    brand: { deletedAt: null },
  };

  if (!isImportedOnlyCatalog()) {
    return extra ? { AND: [active, extra] } : active;
  }

  const imported: Prisma.DeviceWhereInput = {
    ...active,
    importBatchId: { not: null },
    importBatch: {
      is: {
        deletedAt: null,
        purgedAt: null,
      },
    },
  };

  return extra ? { AND: [imported, extra] } : imported;
}

/** Devices created via Admin → Bulk Upload → Upcoming Devices. */
export function bulkUpcomingDeviceWhere(
  extra?: Prisma.DeviceWhereInput,
): Prisma.DeviceWhereInput {
  return catalogDeviceWhere({
    ...extra,
    importBatch: {
      is: {
        kind: 'upcoming-devices',
        deletedAt: null,
        purgedAt: null,
      },
    },
  });
}

/** Imported devices (and imported-only mode) should not get fabricated specs or pricing. */
export function skipSyntheticDeviceData(device: {
  importBatchId?: number | null;
}): boolean {
  return isImportedOnlyCatalog() || device.importBatchId != null;
}

export function catalogNewsWhere(
  extra?: Prisma.NewsWhereInput,
): Prisma.NewsWhereInput {
  const base: Prisma.NewsWhereInput = {
    deletedAt: null,
    ...extra,
  };

  if (!isImportedOnlyCatalog()) {
    return base;
  }

  return {
    ...base,
    importBatchId: { not: null },
    importBatch: {
      is: {
        deletedAt: null,
        purgedAt: null,
      },
    },
  };
}
