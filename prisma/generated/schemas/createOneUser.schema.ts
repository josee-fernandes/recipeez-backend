import type { Prisma } from '../../../generated/prisma/client';
import * as z from 'zod';
import { UserSelectObjectSchema as UserSelectObjectSchema } from './objects/UserSelect.schema';
import { UserCreateInputObjectSchema as UserCreateInputObjectSchema } from './objects/UserCreateInput.schema';
import { UserUncheckedCreateInputObjectSchema as UserUncheckedCreateInputObjectSchema } from './objects/UserUncheckedCreateInput.schema';

export const UserCreateOneSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({ select: UserSelectObjectSchema.optional(),  data: z.union([UserCreateInputObjectSchema, UserUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.UserCreateArgs>;

export const UserCreateOneZodSchema = z.object({ select: UserSelectObjectSchema.optional(),  data: z.union([UserCreateInputObjectSchema, UserUncheckedCreateInputObjectSchema]) }).strict();