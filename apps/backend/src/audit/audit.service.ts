import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type AuditEntry = {
  userId: number;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
};

/** Import-related audit actions (bulk upload lifecycle). */
export const IMPORT_AUDIT_ACTIONS = [
  'import.batch.created',
  'phone.soft_delete',
  'phone.bulk_soft_delete',
  'brand.soft_delete',
  'brand.bulk_soft_delete',
  'brand.restore',
  'import.batch.soft_delete',
  'import.batch.restore',
  'import.batch.purge',
  'import.history.clear',
  'audit.log.clear',
] as const;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(entry: AuditEntry) {
    return this.prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  }

  findRecent(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  findImportRelated(limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { action: { in: [...IMPORT_AUDIT_ACTIONS] } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async clearImportHistory(_clearedByUserId: number) {
    const result = await this.prisma.auditLog.deleteMany({
      where: { action: { in: [...IMPORT_AUDIT_ACTIONS] } },
    });

    return { cleared: result.count };
  }
}
