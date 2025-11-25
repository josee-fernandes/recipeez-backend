import type { Prisma } from '../../../generated/prisma/client';
import * as z from 'zod';
import { UserSelectObjectSchema as UserSelectObjectSchema } from './objects/UserSelect.schema';
import { UserWhereUniqueInputObjectSchema as UserWhereUniqueInputObjectSchema } from './objects/UserWhereUniqueInput.schema';

export const UserFindUniqueOrThrowSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({ select: UserSelectObjectSchema.optional(),  where: UserWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.UserFindUniqueOrThrowArgs>;

export const UserFindUniqueOrThrowZodSchema = z.object({ select: UserSelectObjectSchema.optional(),  where: UserWhereUniqueInputObjectSchema }).strict();