import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

const globalForPrisma = global;

/** @type {PrismaClient} */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
