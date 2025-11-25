import * as z from 'zod';
// prettier-ignore
export const UserModelSchema = z.object({
    id: z.string(),
    email: z.string(),
    password: z.string(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type UserPureType = z.infer<typeof UserModelSchema>;
