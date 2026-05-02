const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Created/Updated Admin: admin@example.com with password123');
  await prisma.$disconnect();
}

main().catch(err => console.error(err));
