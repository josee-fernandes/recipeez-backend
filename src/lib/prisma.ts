// import "dotenv/config";
import { PrismaClient } from '../../generated/prisma/client'

export const prisma = new PrismaClient()

export type { Prisma } from '../../generated/prisma/client'
