const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('Current Users in Database:');
  users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));
  await prisma.$disconnect();
}

checkUsers();
