const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createSuperAdmin() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const user = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log(`Created/Updated Super Admin: ${user.email} with password123`);
  await prisma.$disconnect();
}

createSuperAdmin().catch(err => console.error(err));
