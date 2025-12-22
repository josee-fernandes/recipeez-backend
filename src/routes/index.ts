import type { FastifyInstance } from 'fastify'

import { authRoutes } from './auth'
import { protectedRoutes } from './protected-routes'

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/health', async () => ({ status: 'ok' }))

	await fastify.register(authRoutes)
	await fastify.register(protectedRoutes)
}
