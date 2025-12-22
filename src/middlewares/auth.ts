import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { verifyToken } from '@/lib/jsonwebtoken'
import { prisma } from '@/lib/prisma'

export const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
	try {
		const token = request.headers.authorization?.split(' ')[1]

		if (!token) {
			reply.code(401).send({ error: 'Unauthorized' })
			return
		}

		const valid = verifyToken({ token })

		if (!valid?.email) {
			reply.code(401).send({ error: 'Unauthorized' })
			return
		}

		const user = await prisma.user.findUnique({
			where: { email: valid.email },
		})

		if (!user) {
			reply.code(401).send({ error: 'Unauthorized' })
			return
		}

		request.user = {
			id: user.id,
			email: user.email,
			name: user.name,
		}
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			reply.code(401).send({ error: error.message })
			return
		}

		reply.code(401).send({ error: 'Unauthorized' })
	}
}
