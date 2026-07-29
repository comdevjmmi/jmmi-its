import pkg from '@prisma/client';
// Support both named and default exports from @prisma/client across Prisma/Node versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrismaClient: any = (pkg as any).PrismaClient ?? (pkg as any).default ?? pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main(): Promise<void> {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'adminPassword123',
    SALT_ROUNDS
  );

  // Seed Admin
  const admins = [
    {
      email: 'admin1@jmmi.com',
      password: hashedPassword,
      name: 'Wakil Bidang 1',
    },
    {
      email: 'admin@jmmi.com',
      password: hashedPassword,
      name: 'Admin JMMI',
    }
  ]

  for (const adminData of admins) {
    const admin = await prisma.admin.upsert({
      where: { email: adminData.email },
      update: {},
      create: adminData,
    });
    console.log(`Created admin: ${admin.name}`);
  }

  const staffAnnouncements = [
    {
      nrp: '500000001',
      name: 'Abdullah Azzam',
      codename: 'JMMI-2026-X7Y',
    },
    {
      nrp: '500000002',
      name: 'Budi Santoso',
      codename: 'JMMI-2026-A1B',
    },
    {
      nrp: '500000003',
      name: 'Siti Aminah',
      codename: 'JMMI-2026-C3D',
    },
  ];

  for (const announcement of staffAnnouncements) {
    const user = await prisma.staffAnnouncement.upsert({
      where: { nrp: announcement.nrp },
      update: {},
      create: announcement,
    });
    console.log(`Created staff announcement for: ${user.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
