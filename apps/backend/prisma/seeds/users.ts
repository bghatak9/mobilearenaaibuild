import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@mobilearena.com';
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD ?? 'SuperAdmin123!';

export async function seedUsers(prisma: PrismaClient) {
  const existing = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    if (existing.role !== UserRole.SUPER_ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: UserRole.SUPER_ADMIN, isVerified: true },
      });
      console.log(`  ↑ Promoted ${SUPER_ADMIN_EMAIL} to SUPER_ADMIN`);
    } else {
      console.log(`  ✓ SUPER_ADMIN already exists (${SUPER_ADMIN_EMAIL})`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      name: 'Platform Owner',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  console.log(`  ✓ Created SUPER_ADMIN (${SUPER_ADMIN_EMAIL})`);
}
