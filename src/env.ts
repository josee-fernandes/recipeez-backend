import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z
	.object({
		PORT: z.coerce.number().default(3000),
		HOST: z.string().default('0.0.0.0'),
		DATABASE_URL: z.url(),
		JWT_SECRET: z.string(),
	})
	.safeParse(process.env)

if (!envSchema.success) {
	console.error(envSchema.error.message)
	process.exit(1)
}

export const env = envSchema.data
