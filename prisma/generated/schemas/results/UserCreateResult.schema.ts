import * as z from 'zod';
export const UserCreateResultSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});