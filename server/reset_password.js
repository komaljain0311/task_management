const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetPassword() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const user = await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { password: hashedPassword }
  });
  console.log(`Reset password for ${user.email} to password123`);
  await prisma.$disconnect();
}

resetPassword().catch(err => console.error(err));
