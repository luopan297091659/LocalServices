import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? '';
  const password = process.env.ADMIN_PASSWORD ?? '';
  const nickname = process.env.ADMIN_NICKNAME?.trim() || '運営管理者';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ADMIN_EMAIL 格式无效');
  if (password.length < 14 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('ADMIN_PASSWORD 至少 14 位，并需包含大写字母、小写字母和数字');
  }

  const passwordHash = await argon2.hash(password);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { nickname, passwordHash, role: UserRole.SUPER_ADMIN, status: 'ACTIVE', refreshTokenHash: null },
    create: { email, nickname, passwordHash, role: UserRole.SUPER_ADMIN },
    select: { id: true, email: true, nickname: true, role: true },
  });
  console.info(`Super administrator ready: ${admin.email}`);
}

main()
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
