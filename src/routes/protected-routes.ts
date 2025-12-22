import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/middlewares/auth'
import { recipesRoutes } from './recipes'
import { usersRoutes } from './users'

export const protectedRoutes = async (fastify: FastifyInstance) => {
	fastify.addHook('preHandler', authenticate)

	await fastify.register(usersRoutes)
	await fastify.register(recipesRoutes)
}
