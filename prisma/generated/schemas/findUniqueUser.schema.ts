import type { Prisma } from '../../../generated/prisma/client';
import * as z from 'zod';
import { UserSelectObjectSchema as UserSelectObjectSchema } from './objects/UserSelect.schema';
import { UserWhereUniqueInputObjectSchema as UserWhereUniqueInputObjectSchema } from './objects/UserWhereUniqueInput.schema';

export const UserFindUniqueSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({ select: UserSelectObjectSchema.optional(),  where: UserWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.UserFindUniqueArgs>;

export const UserFindUniqueZodSchema = z.object({ select: UserSelectObjectSchema.optional(),  where: UserWhereUniqueInputObjectSchema }).strict();