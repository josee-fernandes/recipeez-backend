import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth'
import { recipesRoutes } from './recipes'
import { usersRoutes } from './users'

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/health', async () => ({ status: 'ok' }))

	await fastify.register(authRoutes)
	await fastify.register(usersRoutes)
	await fastify.register(recipesRoutes)
}
