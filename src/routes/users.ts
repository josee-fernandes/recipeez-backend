import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { assertAuthenticated } from '@/utils/assert-authenticated'
import { handlePrismaError } from '@/utils/prisma'

export const usersRoutes = async (fastify: FastifyInstance) => {
	fastify.get('/users/:user', async (request: FastifyRequest<{ Params: { user: string } }>, reply: FastifyReply) => {
		try {
			assertAuthenticated(request)

			const result = await prisma.user.findUnique({ where: { id: request.params.user } })

			reply.status(200).send(result)
		} catch (error) {
			handlePrismaError({ fastify, reply, error })
		}
	})
}
