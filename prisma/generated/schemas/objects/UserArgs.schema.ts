import * as z from 'zod';
import type { Prisma } from '../../../../generated/prisma/client';
import { UserSelectObjectSchema as UserSelectObjectSchema } from './UserSelect.schema'

const makeSchema = () => z.object({
  select: z.lazy(() => UserSelectObjectSchema).optional()
}).strict();
export const UserArgsObjectSchema = makeSchema();
export const UserArgsObjectZodSchema = makeSchema();
