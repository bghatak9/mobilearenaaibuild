import { PrismaClient } from '@prisma/client';

import { BADGE_CATALOG } from '../../src/profile/badge-catalog';

export async function seedBadges(prisma: PrismaClient) {
  for (const badge of BADGE_CATALOG) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      create: badge,
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        pointsRequired: badge.pointsRequired,
        category: badge.category,
      },
    });
  }
  console.log(`  ✓ Badge catalog synced (${BADGE_CATALOG.length} badges)`);
}
