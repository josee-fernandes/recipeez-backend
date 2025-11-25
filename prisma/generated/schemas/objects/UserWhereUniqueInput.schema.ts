import * as z from 'zod';
import type { Prisma } from '../../../../generated/prisma/client';


const makeSchema = () => z.object({
  id: z.string().max(24).optional(),
  email: z.string().optional()
}).strict();
export const UserWhereUniqueInputObjectSchema: z.ZodType<Prisma.UserWhereUniqueInput> = makeSchema() as unknown as z.ZodType<Prisma.UserWhereUniqueInput>;
export const UserWhereUniqueInputObjectZodSchema = makeSchema();
