import * as z from 'zod';
export const UserUpsertResultSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});