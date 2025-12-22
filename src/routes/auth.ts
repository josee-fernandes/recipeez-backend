import { hash, verify } from 'argon2'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { generateToken } from '@/lib/jsonwebtoken'
import { type Prisma, prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/utils/prisma'

export const authRoutes = async (fastify: FastifyInstance) => {
	fastify.post(
		'/auth/sign-up',
		async (request: FastifyRequest<{ Body: Prisma.UserCreateInput }>, reply: FastifyReply) => {
			try {
				const data = {
					...request.body,
					password: await hash(request.body.password),
				}

				const result = await prisma.user.create({ data })

				reply.status(201).send(result)
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)

	fastify.post(
		'/auth/sign-in',
		async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
			try {
				const { email, password } = request.body

				const user = await prisma.user.findUnique({ where: { email } })

				if (!user) {
					reply.status(401).send({ error: 'Invalid credentials' })
					return
				}

				const isPasswordValid = await verify(user.password, password)

				if (!isPasswordValid) {
					reply.status(401).send({ error: 'Invalid credentials' })
					return
				}

				const token = generateToken({ email })

				const result = {
					id: user.id,
					email: user.email,
					name: user.name,
					token,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				}

				reply.status(201).send(result)
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)
}
