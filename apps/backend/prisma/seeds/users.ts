import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@mobilearena.com';
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD ?? 'SuperAdmin123!';

const EDITOR_EMAIL = process.env.EDITOR_EMAIL ?? 'editor@mobilearena.com';
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD ?? 'Editor123!';

async function upsertStaffUser(
  prisma: PrismaClient,
  opts: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  },
) {
  const passwordHash = await bcrypt.hash(opts.password, 10);
  const existing = await prisma.user.findUnique({
    where: { email: opts.email },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: opts.role,
        passwordHash,
        isVerified: true,
        isActive: true,
        isBlocked: false,
      },
    });
    console.log(`  ✓ ${opts.role} synced (${opts.email})`);
    return;
  }

  await prisma.user.create({
    data: {
      email: opts.email,
      name: opts.name,
      passwordHash,
      role: opts.role,
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`  ✓ Created ${opts.role} (${opts.email})`);
}

export async function seedUsers(prisma: PrismaClient) {
  await upsertStaffUser(prisma, {
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    name: 'Platform Owner',
    role: UserRole.SUPER_ADMIN,
  });

  await upsertStaffUser(prisma, {
    email: EDITOR_EMAIL,
    password: EDITOR_PASSWORD,
    name: 'Content Editor',
    role: UserRole.EDITOR,
  });
}
