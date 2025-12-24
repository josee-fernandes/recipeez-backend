import type { FastifyPluginAsync } from 'fastify'

export const authPlugin: FastifyPluginAsync = async (fastify) => {
	fastify.decorateRequest('user', null)
}
