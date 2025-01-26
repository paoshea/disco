import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'minimal',
});

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Initial database connection failed:', error));

export { prisma };