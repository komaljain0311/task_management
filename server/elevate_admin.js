const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function elevateAdmin() {
  const user = await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { role: 'ADMIN' }
  });
  console.log(`Elevated ${user.name} to ADMIN`);
  await prisma.$disconnect();
}

elevateAdmin().catch(err => console.error(err));
