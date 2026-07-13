import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImportBatchStatus, UserRole } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { assertDeleteAction } from './delete-permissions';
import type { BulkImportKind, ImportActor } from './import.types';

const DEVICE_CACHE_PREFIX = 'devices:';
const NEWS_CACHE_PREFIX = 'news:';

export type RecordBatchInput = {
  kind: BulkImportKind;
  fileName: string;
  jobId?: string;
  actor: ImportActor;
  totalRows: number;
  inserted: number;
  skipped: number;
  deviceIds: number[];
};

export type RecordAdvertisementBatchInput = {
  fileName: string;
  jobId?: string;
  actor: ImportActor;
  totalRows: number;
  inserted: number;
  skipped: number;
  advertisementIds: number[];
};

export type RecordNewsBatchInput = {
  fileName: string;
  jobId?: string;
  actor: ImportActor;
  totalRows: number;
  inserted: number;
  skipped: number;
  newsIds: number[];
  batchKind?: BulkImportKind;
};

export type RecordBrandBatchInput = {
  fileName: string;
  jobId?: string;
  actor: ImportActor;
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  brands: { id: number; slug: string; name: string }[];
};

export type RecordReviewBatchInput = {
  fileName: string;
  jobId?: string;
  actor: ImportActor;
  totalRows: number;
  inserted: number;
  skipped: number;
  reviews: { id: number; slug: string; title: string }[];
  batchKind?: BulkImportKind;
};

@Injectable()
export class ImportLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: CacheService,
  ) {}

  async recordBatch(input: RecordBatchInput) {
    if (input.inserted === 0) return null;

    const devices = await this.prisma.device.findMany({
      where: { id: { in: input.deviceIds } },
      select: { id: true, slug: true, name: true },
    });

    const batch = await this.prisma.importBatch.create({
      data: {
        kind: input.kind,
        fileName: input.fileName,
        jobId: input.jobId ?? null,
        totalRows: input.totalRows,
        inserted: input.inserted,
        skipped: input.skipped,
        importedById: input.actor.userId,
        items: {
          create: devices.map((d) => ({
            entityType: 'device',
            entityId: d.id,
            entitySlug: d.slug,
            entityName: d.name,
            deviceId: d.id,
          })),
        },
      },
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        _count: { select: { items: true } },
      },
    });

    await this.prisma.device.updateMany({
      where: { id: { in: input.deviceIds } },
      data: { importBatchId: batch.id },
    });

    await this.audit.log({
      userId: input.actor.userId,
      action: 'import.batch.created',
      entity: 'ImportBatch',
      entityId: String(batch.id),
    });

    return batch;
  }

  async recordNewsBatch(input: RecordNewsBatchInput) {
    if (input.inserted === 0) return null;

    const articles = await this.prisma.news.findMany({
      where: { id: { in: input.newsIds } },
      select: { id: true, slug: true, title: true },
    });

    const batch = await this.prisma.importBatch.create({
      data: {
        kind: input.batchKind ?? 'news',
        fileName: input.fileName,
        jobId: input.jobId ?? null,
        totalRows: input.totalRows,
        inserted: input.inserted,
        skipped: input.skipped,
        importedById: input.actor.userId,
        items: {
          create: articles.map((article) => ({
            entityType: 'news',
            entityId: article.id,
            entitySlug: article.slug,
            entityName: article.title,
            newsId: article.id,
          })),
        },
      },
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        _count: { select: { items: true } },
      },
    });

    await this.prisma.news.updateMany({
      where: { id: { in: input.newsIds } },
      data: { importBatchId: batch.id },
    });

    await this.cache.delByPrefix(NEWS_CACHE_PREFIX);

    await this.audit.log({
      userId: input.actor.userId,
      action: 'import.batch.created',
      entity: 'ImportBatch',
      entityId: String(batch.id),
    });

    return batch;
  }

  async recordBrandBatch(input: RecordBrandBatchInput) {
    if (input.brands.length === 0) return null;

    const batch = await this.prisma.importBatch.create({
      data: {
        kind: 'brands',
        fileName: input.fileName,
        jobId: input.jobId ?? null,
        totalRows: input.totalRows,
        inserted: input.inserted,
        skipped: input.skipped + input.updated,
        importedById: input.actor.userId,
        items: {
          create: input.brands.map((brand) => ({
            entityType: 'brand',
            entityId: brand.id,
            entitySlug: brand.slug,
            entityName: brand.name,
            brandId: brand.id,
          })),
        },
      },
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        _count: { select: { items: true } },
      },
    });

    await this.audit.log({
      userId: input.actor.userId,
      action: 'import.batch.created',
      entity: 'ImportBatch',
      entityId: String(batch.id),
    });

    return batch;
  }

  async recordReviewBatch(input: RecordReviewBatchInput) {
    if (input.reviews.length === 0) return null;

    const batch = await this.prisma.importBatch.create({
      data: {
        kind: input.batchKind ?? 'reviews',
        fileName: input.fileName,
        jobId: input.jobId ?? null,
        totalRows: input.totalRows,
        inserted: input.inserted,
        skipped: input.skipped,
        importedById: input.actor.userId,
        items: {
          create: input.reviews.map((review) => ({
            entityType: 'review',
            entityId: review.id,
            entitySlug: review.slug,
            entityName: review.title,
          })),
        },
      },
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        _count: { select: { items: true } },
      },
    });

    await this.audit.log({
      userId: input.actor.userId,
      action: 'import.batch.created',
      entity: 'ImportBatch',
      entityId: String(batch.id),
    });

    return batch;
  }

  async recordAdvertisementBatch(input: RecordAdvertisementBatchInput) {
    if (input.inserted === 0) return null;

    const ads = await this.prisma.paidAdvertisement.findMany({
      where: { id: { in: input.advertisementIds } },
      select: { id: true, slug: true, title: true },
    });

    const batch = await this.prisma.importBatch.create({
      data: {
        kind: 'advertisements',
        fileName: input.fileName,
        jobId: input.jobId ?? null,
        totalRows: input.totalRows,
        inserted: input.inserted,
        skipped: input.skipped,
        importedById: input.actor.userId,
        items: {
          create: ads.map((ad) => ({
            entityType: 'advertisement',
            entityId: ad.id,
            entitySlug: ad.slug,
            entityName: ad.title,
            advertisementId: ad.id,
          })),
        },
      },
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        _count: { select: { items: true } },
      },
    });

    await this.prisma.paidAdvertisement.updateMany({
      where: { id: { in: input.advertisementIds } },
      data: { importBatchId: batch.id },
    });

    await this.audit.log({
      userId: input.actor.userId,
      action: 'import.batch.created',
      entity: 'ImportBatch',
      entityId: String(batch.id),
    });

    return batch;
  }

  async listBatches(options: {
    kind?: string;
    includeDeleted?: boolean;
    limit?: number;
  }) {
    const where = {
      ...(options.kind ? { kind: options.kind } : {}),
      ...(options.includeDeleted ? {} : { purgedAt: null }),
    };

    return this.prisma.importBatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit ?? 50,
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
  }

  async getBatch(id: number) {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id },
      include: {
        importedBy: { select: { id: true, email: true, role: true } },
        items: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
                slug: true,
                deletedAt: true,
                brand: { select: { name: true } },
              },
            },
            advertisement: {
              select: {
                id: true,
                title: true,
                slug: true,
                link: true,
                placement: true,
                deletedAt: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                deletedAt: true,
              },
            },
            news: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                deletedAt: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!batch) throw new NotFoundException('Upload batch not found');
    return batch;
  }

  async softDeletePhone(id: number, actor: ImportActor) {
    assertDeleteAction(actor.role, 'delete_one_phone');
    return this.softDeletePhones([id], actor);
  }

  async softDeletePhones(ids: number[], actor: ImportActor) {
    const action =
      ids.length === 1 ? 'delete_one_phone' : 'delete_selected_phones';
    assertDeleteAction(actor.role, action);

    const active = await this.prisma.device.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    if (active.length === 0) {
      throw new BadRequestException('No active phones found to delete');
    }

    const now = new Date();
    const activeIds = active.map((d) => d.id);

    await this.prisma.$transaction([
      this.prisma.device.updateMany({
        where: { id: { in: activeIds } },
        data: { deletedAt: now },
      }),
      this.prisma.importBatchItem.updateMany({
        where: { deviceId: { in: activeIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    const batchIds = [
      ...new Set(
        active
          .map((d) => d.importBatchId)
          .filter((x): x is number => x != null),
      ),
    ];
    for (const batchId of batchIds) {
      await this.refreshBatchStatus(batchId);
    }

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    await this.audit.log({
      userId: actor.userId,
      action: action === 'delete_one_phone' ? 'phone.soft_delete' : 'phone.bulk_soft_delete',
      entity: 'Device',
      entityId: activeIds.join(','),
    });

    return { deleted: activeIds.length, ids: activeIds };
  }

  private async cascadeSoftDeletePhonesForBrands(
    brandIds: number[],
    now: Date,
  ): Promise<{ deletedPhones: number; phoneIds: number[] }> {
    if (brandIds.length === 0) {
      return { deletedPhones: 0, phoneIds: [] };
    }

    const phones = await this.prisma.device.findMany({
      where: { brandId: { in: brandIds }, deletedAt: null },
      select: { id: true, importBatchId: true },
    });
    if (phones.length === 0) {
      return { deletedPhones: 0, phoneIds: [] };
    }

    const phoneIds = phones.map((phone) => phone.id);

    await this.prisma.$transaction([
      this.prisma.device.updateMany({
        where: { id: { in: phoneIds } },
        data: { deletedAt: now },
      }),
      this.prisma.importBatchItem.updateMany({
        where: { deviceId: { in: phoneIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    const phoneBatchIds = [
      ...new Set(
        phones
          .map((phone) => phone.importBatchId)
          .filter((id): id is number => id != null),
      ),
    ];
    for (const phoneBatchId of phoneBatchIds) {
      await this.refreshBatchStatus(phoneBatchId);
    }

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    return { deletedPhones: phoneIds.length, phoneIds };
  }

  async softDeleteBrand(id: number, actor: ImportActor) {
    assertDeleteAction(actor.role, 'delete_one_brand');
    return this.softDeleteBrands([id], actor);
  }

  async softDeleteBrands(ids: number[], actor: ImportActor) {
    const action =
      ids.length === 1 ? 'delete_one_brand' : 'delete_selected_brands';
    assertDeleteAction(actor.role, action);

    const active = await this.prisma.brand.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    if (active.length === 0) {
      throw new BadRequestException('No active brands found to delete');
    }

    const activeIds = active.map((brand) => brand.id);

    const now = new Date();
    const { deletedPhones } = await this.cascadeSoftDeletePhonesForBrands(
      activeIds,
      now,
    );

    await this.prisma.$transaction([
      this.prisma.brand.updateMany({
        where: { id: { in: activeIds } },
        data: { deletedAt: now },
      }),
      this.prisma.importBatchItem.updateMany({
        where: {
          entityType: 'brand',
          entityId: { in: activeIds },
          deletedAt: null,
        },
        data: { deletedAt: now },
      }),
    ]);

    const batchIds = [
      ...new Set(
        (
          await this.prisma.importBatchItem.findMany({
            where: { entityType: 'brand', entityId: { in: activeIds } },
            select: { batchId: true },
          })
        ).map((item) => item.batchId),
      ),
    ];
    for (const batchId of batchIds) {
      await this.refreshBatchStatus(batchId);
    }

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    await this.audit.log({
      userId: actor.userId,
      action:
        action === 'delete_one_brand'
          ? 'brand.soft_delete'
          : 'brand.bulk_soft_delete',
      entity: 'Brand',
      entityId: activeIds.join(','),
    });

    return { deleted: activeIds.length, ids: activeIds, deletedPhones };
  }

  async softDeleteAdvertisement(id: number, actor: ImportActor) {
    assertDeleteAction(actor.role, 'delete_one_advertisement');
    return this.softDeleteAdvertisements([id], actor);
  }

  async softDeleteAdvertisements(ids: number[], actor: ImportActor) {
    const action =
      ids.length === 1
        ? 'delete_one_advertisement'
        : 'delete_selected_advertisements';
    assertDeleteAction(actor.role, action);

    const active = await this.prisma.paidAdvertisement.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    if (active.length === 0) {
      throw new BadRequestException('No active advertisements found to delete');
    }

    const now = new Date();
    const activeIds = active.map((ad) => ad.id);

    await this.prisma.$transaction([
      this.prisma.paidAdvertisement.updateMany({
        where: { id: { in: activeIds } },
        data: { deletedAt: now },
      }),
      this.prisma.importBatchItem.updateMany({
        where: { advertisementId: { in: activeIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    const batchIds = [
      ...new Set(
        active
          .map((ad) => ad.importBatchId)
          .filter((x): x is number => x != null),
      ),
    ];
    for (const batchId of batchIds) {
      await this.refreshBatchStatus(batchId);
    }

    await this.audit.log({
      userId: actor.userId,
      action:
        action === 'delete_one_advertisement'
          ? 'advertisement.soft_delete'
          : 'advertisement.bulk_soft_delete',
      entity: 'PaidAdvertisement',
      entityId: activeIds.join(','),
    });

    return { deleted: activeIds.length, ids: activeIds };
  }

  async softDeleteBatch(batchId: number, actor: ImportActor) {
    assertDeleteAction(actor.role, 'delete_entire_import');

    const batch = await this.getBatch(batchId);
    if (batch.purgedAt) {
      throw new BadRequestException('Upload batch was permanently purged');
    }
    if (batch.deletedAt) {
      throw new BadRequestException('Upload batch is already deleted');
    }

    const now = new Date();
    const isAdBatch = batch.kind === 'advertisements';
    const isBrandBatch = batch.kind === 'brands';

    if (isBrandBatch) {
      const brandIds = batch.items
        .filter((i) => i.entityType === 'brand' && !i.deletedAt)
        .map((i) => i.entityId);

      if (brandIds.length === 0) {
        throw new BadRequestException('No active brands found in this upload');
      }

      const { deletedPhones } = await this.cascadeSoftDeletePhonesForBrands(
        brandIds,
        now,
      );

      await this.prisma.$transaction([
        this.prisma.importBatch.update({
          where: { id: batchId },
          data: { deletedAt: now, status: ImportBatchStatus.FULLY_DELETED },
        }),
        this.prisma.importBatchItem.updateMany({
          where: { batchId, deletedAt: null },
          data: { deletedAt: now },
        }),
        this.prisma.brand.updateMany({
          where: { id: { in: brandIds }, deletedAt: null },
          data: { deletedAt: now },
        }),
      ]);

      await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

      await this.audit.log({
        userId: actor.userId,
        action: 'import.batch.soft_delete',
        entity: 'ImportBatch',
        entityId: String(batchId),
      });

      return { batchId, deleted: brandIds.length, deletedPhones };
    }

    if (isAdBatch) {
      const adIds = batch.items
        .filter((i) => i.advertisementId && !i.deletedAt)
        .map((i) => i.advertisementId!);

      await this.prisma.$transaction([
        this.prisma.importBatch.update({
          where: { id: batchId },
          data: { deletedAt: now, status: ImportBatchStatus.FULLY_DELETED },
        }),
        this.prisma.importBatchItem.updateMany({
          where: { batchId, deletedAt: null },
          data: { deletedAt: now },
        }),
        this.prisma.paidAdvertisement.updateMany({
          where: { id: { in: adIds }, deletedAt: null },
          data: { deletedAt: now },
        }),
      ]);

      await this.audit.log({
        userId: actor.userId,
        action: 'import.batch.soft_delete',
        entity: 'ImportBatch',
        entityId: String(batchId),
      });

      return { batchId, deleted: adIds.length };
    }

    const deviceIds = batch.items
      .filter((i) => i.deviceId && !i.deletedAt)
      .map((i) => i.deviceId!);

    await this.prisma.$transaction([
      this.prisma.importBatch.update({
        where: { id: batchId },
        data: { deletedAt: now, status: ImportBatchStatus.FULLY_DELETED },
      }),
      this.prisma.importBatchItem.updateMany({
        where: { batchId, deletedAt: null },
        data: { deletedAt: now },
      }),
      this.prisma.device.updateMany({
        where: { id: { in: deviceIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    await this.audit.log({
      userId: actor.userId,
      action: 'import.batch.soft_delete',
      entity: 'ImportBatch',
      entityId: String(batchId),
    });

    return { batchId, deleted: deviceIds.length };
  }

  async restoreBatch(batchId: number, actor: ImportActor) {
    const batch = await this.getBatch(batchId);
    const isAdBatch = batch.kind === 'advertisements';
    const isBrandBatch = batch.kind === 'brands';
    assertDeleteAction(
      actor.role,
      isAdBatch
        ? 'restore_deleted_advertisements'
        : isBrandBatch
          ? 'restore_deleted_brands'
          : 'restore_deleted_import',
    );

    if (batch.purgedAt) {
      throw new BadRequestException('Cannot restore a purged upload');
    }

    if (isBrandBatch) {
      const deletedBrandIds = batch.items
        .filter(
          (i) =>
            i.entityType === 'brand' &&
            (i.brand?.deletedAt || i.deletedAt),
        )
        .map((i) => i.entityId);

      if (!batch.deletedAt && deletedBrandIds.length === 0) {
        throw new BadRequestException('Upload batch has nothing to restore');
      }

      await this.prisma.$transaction([
        this.prisma.importBatch.update({
          where: { id: batchId },
          data: {
            deletedAt: null,
            status: ImportBatchStatus.COMPLETED,
          },
        }),
        this.prisma.importBatchItem.updateMany({
          where: { batchId, deletedAt: { not: null } },
          data: { deletedAt: null },
        }),
        this.prisma.brand.updateMany({
          where: { id: { in: deletedBrandIds } },
          data: { deletedAt: null },
        }),
      ]);

      await this.refreshBatchStatus(batchId);

      await this.audit.log({
        userId: actor.userId,
        action: 'import.batch.restore',
        entity: 'ImportBatch',
        entityId: String(batchId),
      });

      return { batchId, restored: deletedBrandIds.length };
    }

    if (isAdBatch) {
      const deletedAdIds = batch.items
        .filter((i) => i.advertisementId && i.advertisement?.deletedAt)
        .map((i) => i.advertisementId!);

      if (!batch.deletedAt && deletedAdIds.length === 0) {
        throw new BadRequestException('Upload batch has nothing to restore');
      }

      await this.prisma.$transaction([
        this.prisma.importBatch.update({
          where: { id: batchId },
          data: {
            deletedAt: null,
            status: ImportBatchStatus.COMPLETED,
          },
        }),
        this.prisma.importBatchItem.updateMany({
          where: { batchId, deletedAt: { not: null } },
          data: { deletedAt: null },
        }),
        this.prisma.paidAdvertisement.updateMany({
          where: { id: { in: deletedAdIds } },
          data: { deletedAt: null },
        }),
      ]);

      await this.audit.log({
        userId: actor.userId,
        action: 'import.batch.restore',
        entity: 'ImportBatch',
        entityId: String(batchId),
      });

      return { batchId, restored: deletedAdIds.length };
    }

    const deletedDeviceIds = batch.items
      .filter((i) => i.deviceId && i.device?.deletedAt)
      .map((i) => i.deviceId!);

    if (!batch.deletedAt && deletedDeviceIds.length === 0) {
      throw new BadRequestException('Upload batch has nothing to restore');
    }

    await this.prisma.$transaction([
      this.prisma.importBatch.update({
        where: { id: batchId },
        data: {
          deletedAt: null,
          status: ImportBatchStatus.COMPLETED,
        },
      }),
      this.prisma.importBatchItem.updateMany({
        where: { batchId, deletedAt: { not: null } },
        data: { deletedAt: null },
      }),
      this.prisma.device.updateMany({
        where: { id: { in: deletedDeviceIds } },
        data: { deletedAt: null },
      }),
    ]);

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    await this.audit.log({
      userId: actor.userId,
      action: 'import.batch.restore',
      entity: 'ImportBatch',
      entityId: String(batchId),
    });

    return { batchId, restored: deletedDeviceIds.length };
  }

  async restoreAdvertisement(id: number, actor: ImportActor) {
    return this.restoreAdvertisements([id], actor);
  }

  async restoreAdvertisements(ids: number[], actor: ImportActor) {
    assertDeleteAction(actor.role, 'restore_deleted_advertisements');

    const deleted = await this.prisma.paidAdvertisement.findMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
    });
    if (deleted.length === 0) {
      throw new BadRequestException('No deleted advertisements found to restore');
    }

    const restoredIds = deleted.map((ad) => ad.id);

    await this.prisma.$transaction([
      this.prisma.paidAdvertisement.updateMany({
        where: { id: { in: restoredIds } },
        data: { deletedAt: null },
      }),
      this.prisma.importBatchItem.updateMany({
        where: { advertisementId: { in: restoredIds }, deletedAt: { not: null } },
        data: { deletedAt: null },
      }),
    ]);

    const batchIds = [
      ...new Set(
        deleted
          .map((ad) => ad.importBatchId)
          .filter((x): x is number => x != null),
      ),
    ];
    for (const batchId of batchIds) {
      await this.refreshBatchStatus(batchId);
      await this.prisma.importBatch.update({
        where: { id: batchId },
        data: { deletedAt: null },
      });
    }

    await this.audit.log({
      userId: actor.userId,
      action: 'advertisement.restore',
      entity: 'PaidAdvertisement',
      entityId: restoredIds.join(','),
    });

    return { restored: restoredIds.length, ids: restoredIds };
  }

  async restoreBrand(id: number, actor: ImportActor) {
    return this.restoreBrands([id], actor);
  }

  async restoreBrands(ids: number[], actor: ImportActor) {
    assertDeleteAction(actor.role, 'restore_deleted_brands');

    const deleted = await this.prisma.brand.findMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
    });
    if (deleted.length === 0) {
      throw new BadRequestException('No deleted brands found to restore');
    }

    const restoredIds = deleted.map((brand) => brand.id);

    await this.prisma.$transaction([
      this.prisma.brand.updateMany({
        where: { id: { in: restoredIds } },
        data: { deletedAt: null },
      }),
      this.prisma.importBatchItem.updateMany({
        where: {
          entityType: 'brand',
          entityId: { in: restoredIds },
          deletedAt: { not: null },
        },
        data: { deletedAt: null },
      }),
    ]);

    const batchIds = [
      ...new Set(
        (
          await this.prisma.importBatchItem.findMany({
            where: { entityType: 'brand', entityId: { in: restoredIds } },
            select: { batchId: true },
          })
        ).map((item) => item.batchId),
      ),
    ];
    for (const batchId of batchIds) {
      await this.refreshBatchStatus(batchId);
      await this.prisma.importBatch.update({
        where: { id: batchId },
        data: { deletedAt: null },
      });
    }

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    await this.audit.log({
      userId: actor.userId,
      action: 'brand.restore',
      entity: 'Brand',
      entityId: restoredIds.join(','),
    });

    return { restored: restoredIds.length, ids: restoredIds };
  }

  async purgeBatch(batchId: number, actor: ImportActor) {
    assertDeleteAction(actor.role, 'permanently_purge');

    const batch = await this.getBatch(batchId);
    if (batch.purgedAt) {
      throw new BadRequestException('Upload batch already purged');
    }

    const isAdBatch = batch.kind === 'advertisements';
    const isBrandBatch = batch.kind === 'brands';
    const now = new Date();

    if (isBrandBatch) {
      const brandIds = batch.items
        .filter((i) => i.entityType === 'brand')
        .map((i) => i.entityId);

      let phonesPurged = 0;

      await this.prisma.$transaction(async (tx) => {
        const phoneIds = (
          await tx.device.findMany({
            where: { brandId: { in: brandIds } },
            select: { id: true },
          })
        ).map((device) => device.id);

        if (phoneIds.length > 0) {
          await tx.device.deleteMany({ where: { id: { in: phoneIds } } });
          phonesPurged = phoneIds.length;
        }

        if (brandIds.length > 0) {
          await tx.brand.deleteMany({ where: { id: { in: brandIds } } });
        }

        await tx.importBatchItem.updateMany({
          where: { batchId },
          data: { deletedAt: now },
        });
        await tx.importBatch.update({
          where: { id: batchId },
          data: {
            purgedAt: now,
            deletedAt: batch.deletedAt ?? now,
            status: ImportBatchStatus.PURGED,
          },
        });
      });

      await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

      await this.audit.log({
        userId: actor.userId,
        action: 'import.batch.purge',
        entity: 'ImportBatch',
        entityId: String(batchId),
      });

      return {
        batchId,
        purged: brandIds.length,
        hardDeleted: brandIds.length,
        phonesPurged,
      };
    }

    if (isAdBatch) {
      const adIds = batch.items
        .filter((i) => i.advertisementId)
        .map((i) => i.advertisementId!);

      await this.prisma.$transaction(async (tx) => {
        if (adIds.length > 0) {
          await tx.paidAdvertisement.deleteMany({ where: { id: { in: adIds } } });
        }
        await tx.importBatch.update({
          where: { id: batchId },
          data: {
            purgedAt: now,
            deletedAt: batch.deletedAt ?? now,
            status: ImportBatchStatus.PURGED,
          },
        });
      });

      await this.audit.log({
        userId: actor.userId,
        action: 'import.batch.purge',
        entity: 'ImportBatch',
        entityId: String(batchId),
      });

      return { batchId, purged: adIds.length };
    }

    const deviceIds = batch.items
      .filter((i) => i.deviceId)
      .map((i) => i.deviceId!);

    await this.prisma.$transaction(async (tx) => {
      if (deviceIds.length > 0) {
        await tx.device.deleteMany({ where: { id: { in: deviceIds } } });
      }
      await tx.importBatch.update({
        where: { id: batchId },
        data: {
          purgedAt: now,
          deletedAt: batch.deletedAt ?? now,
          status: ImportBatchStatus.PURGED,
        },
      });
    });

    await this.cache.delByPrefix(DEVICE_CACHE_PREFIX);

    await this.audit.log({
      userId: actor.userId,
      action: 'import.batch.purge',
      entity: 'ImportBatch',
      entityId: String(batchId),
    });

    return { batchId, purged: deviceIds.length };
  }

  async clearDeletedImportHistory(actor: ImportActor) {
    assertDeleteAction(actor.role, 'clear_deleted_import_history');

    const result = await this.prisma.importBatch.deleteMany({
      where: {
        OR: [
          { deletedAt: { not: null } },
          { purgedAt: { not: null } },
          { status: ImportBatchStatus.FULLY_DELETED },
          { status: ImportBatchStatus.PURGED },
        ],
      },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'import.history.clear',
      entity: 'ImportBatch',
      entityId: String(result.count),
    });

    return { cleared: result.count };
  }

  private async refreshBatchStatus(batchId: number) {
    const [total, deleted] = await Promise.all([
      this.prisma.importBatchItem.count({ where: { batchId } }),
      this.prisma.importBatchItem.count({
        where: { batchId, deletedAt: { not: null } },
      }),
    ]);

    let status: ImportBatchStatus = ImportBatchStatus.COMPLETED;
    if (deleted === total && total > 0) {
      status = ImportBatchStatus.FULLY_DELETED;
    } else if (deleted > 0) {
      status = ImportBatchStatus.PARTIALLY_DELETED;
    }

    await this.prisma.importBatch.update({
      where: { id: batchId },
      data: { status },
    });
  }
}
