import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

const globalForPrisma = global;

/** @type {PrismaClient} */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDev ? ['error', 'warn'] : ['error'],
  });

if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

// Export both named and default so all import styles work
export { prisma };
export default prisma;
