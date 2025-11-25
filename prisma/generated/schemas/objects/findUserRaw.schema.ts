import * as z from 'zod';
import type { Prisma } from '../../../../generated/prisma/client';


import { JsonValueSchema as jsonSchema } from '../../helpers/json-helpers';

const makeSchema = () => z.object({
  filter: jsonSchema.optional(),
  options: jsonSchema.optional()
}).strict();
export const UserFindRawObjectSchema = makeSchema();
export const UserFindRawObjectZodSchema = makeSchema();
