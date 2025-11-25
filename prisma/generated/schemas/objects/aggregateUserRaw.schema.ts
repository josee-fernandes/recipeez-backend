import * as z from 'zod';
import type { Prisma } from '../../../../generated/prisma/client';


import { JsonValueSchema as jsonSchema } from '../../helpers/json-helpers';

const makeSchema = () => z.object({
  pipeline: jsonSchema.array().optional(),
  options: jsonSchema.optional()
}).strict();
export const UserAggregateRawObjectSchema = makeSchema();
export const UserAggregateRawObjectZodSchema = makeSchema();
