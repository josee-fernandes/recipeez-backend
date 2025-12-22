import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'

export const usersRoutes = async (fastify: FastifyInstance) => {
	fastify.get('/users/:user', async (request: FastifyRequest<{ Params: { user: string } }>, reply: FastifyReply) => {
		const result = await prisma.user.findUnique({ where: { id: request.params.user } })

		reply.status(200).send(result)
	})
}
