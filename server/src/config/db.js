const { PrismaClient } = require('@prisma/client');

// Prisma 7 requires at least an empty object for options if using prisma.config.ts
const prisma = new PrismaClient({});

module.exports = prisma;
