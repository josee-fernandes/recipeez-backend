import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { hash, verify } from 'argon2'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { generateToken } from '@/lib/jsonwebtoken'
import { type Prisma, prisma } from '@/lib/prisma'

const handlePrismaError = ({
	fastify,
	reply,
	error,
}: {
	fastify: FastifyInstance
	reply: FastifyReply
	error: unknown
}) => {
	fastify.log.error(error)

	// https://www.prisma.io/docs/orm/reference/error-reference

	if (error instanceof PrismaClientValidationError) {
		reply.status(400).send({
			error: 'Validation Error',
		})
		return
	}

	if (error instanceof PrismaClientKnownRequestError) {
		let message = 'Unknown error'

		if (error.code === 'P2002') {
			message = 'There is a unique constraint violation, a new user cannot be created with this email'
		}

		reply.status(400).send({
			error: 'Database Error',
			message,
		})
		return
	}
}

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/', async () => {
		return { hello: 'world' }
	})

	fastify.get('/health', async () => {
		return { status: 'ok' }
	})

	fastify.get('/users/:user', async (request: FastifyRequest<{ Params: { user: string } }>, reply: FastifyReply) => {
		const result = await prisma.user.findUnique({ where: { id: request.params.user } })

		reply.status(200).send(result)
	})

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

				reply.status(201).send({ token })
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)
}
