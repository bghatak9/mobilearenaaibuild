import { PrismaClient, UserRole } from '@prisma/client';

import { hashPassword } from '../../src/auth/password-crypto';

const MODERATOR_EMAIL =
  process.env.MODERATOR_EMAIL ?? 'moderator@mobilearena.com';
const MODERATOR_PASSWORD =
  process.env.MODERATOR_PASSWORD ?? 'Moderator123!';

const AUTHOR_EMAIL = process.env.AUTHOR_EMAIL ?? 'author@mobilearena.com';
const AUTHOR_PASSWORD = process.env.AUTHOR_PASSWORD ?? 'Author123!';

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@mobilearena.com';
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD ?? 'SuperAdmin123!';

const EDITOR_EMAIL = process.env.EDITOR_EMAIL ?? 'editor@mobilearena.com';
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD ?? 'Editor123!';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@mobilearena.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!';

const TEST_ADMIN_EMAIL =
  process.env.TEST_ADMIN_EMAIL ?? 'testadmi@mobilearena.com';
const TEST_ADMIN_PASSWORD =
  process.env.TEST_ADMIN_PASSWORD ?? 'TestAdmi123!';

async function upsertStaffUser(
  prisma: PrismaClient,
  opts: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  },
) {
  const passwordHash = await hashPassword(opts.password);
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

  await upsertStaffUser(prisma, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: 'Admin',
    role: UserRole.ADMIN,
  });

  await upsertStaffUser(prisma, {
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
    name: 'Test Admin',
    role: UserRole.ADMIN,
  });

  await upsertStaffUser(prisma, {
    email: AUTHOR_EMAIL,
    password: AUTHOR_PASSWORD,
    name: 'Content Author',
    role: UserRole.AUTHOR,
  });

  await upsertStaffUser(prisma, {
    email: MODERATOR_EMAIL,
    password: MODERATOR_PASSWORD,
    name: 'Community Moderator',
    role: UserRole.MODERATOR,
  });
}
