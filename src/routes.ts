import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { hash, verify } from 'argon2'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { generateToken, verifyToken } from '@/lib/jsonwebtoken'
import { type Prisma, prisma } from '@/lib/prisma'
import { deleteFromR2, uploadToR2 } from '@/lib/r2'

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
	fastify.get('/health', async () => {
		return { status: 'ok' }
	})

	// Auth

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

	fastify.get('/users/:user', async (request: FastifyRequest<{ Params: { user: string } }>, reply: FastifyReply) => {
		const result = await prisma.user.findUnique({ where: { id: request.params.user } })

		reply.status(200).send(result)
	})

	fastify.get('/recipes', async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const token = request.headers.authorization?.split(' ')[1]

			if (!token) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const valid = verifyToken({ token })

			if (!valid?.email) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const user = await prisma.user.findUnique({ where: { email: valid.email } })

			if (!user) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const result = await prisma.recipe.findMany({
				include: { user: { select: { id: true, email: true, name: true, createdAt: true, updatedAt: true } } },
			})

			reply.status(200).send(result)
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				reply.status(401).send({ error: error.message })
				return
			}

			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.get('/recipes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
		try {
			const token = request.headers.authorization?.split(' ')[1]

			if (!token) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const valid = verifyToken({ token })

			if (!valid?.email) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const user = await prisma.user.findUnique({ where: { email: valid.email } })

			if (!user) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const result = await prisma.recipe.findUnique({
				where: { id: request.params.id },
				include: { user: { select: { id: true, email: true, name: true, createdAt: true, updatedAt: true } } },
			})

			reply.status(200).send(result)
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				reply.status(401).send({ error: error.message })
				return
			}

			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.post('/recipes', async (request: FastifyRequest<{ Body: Prisma.RecipeCreateInput }>, reply: FastifyReply) => {
		try {
			const token = request.headers.authorization?.split(' ')[1]

			if (!token) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const valid = verifyToken({ token })

			if (!valid?.email) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const user = await prisma.user.findUnique({ where: { email: valid.email } })

			if (!user) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const data: Prisma.RecipeCreateInput = {
				...request.body,
				user: {
					connect: {
						id: user.id,
					},
				},
			}

			const result = await prisma.recipe.create({ data })

			reply.status(201).send(result)
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				reply.status(401).send({ error: error.message })
				return
			}

			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.post(
		'/recipes/:id/photo',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			try {
				const token = request.headers.authorization?.split(' ')[1]

				if (!token) {
					reply.status(401).send({ error: 'Unauthorized' })
					return
				}

				const valid = verifyToken({ token })

				if (!valid?.email) {
					reply.status(401).send({ error: 'Unauthorized' })
					return
				}

				const user = await prisma.user.findUnique({ where: { email: valid.email } })

				if (!user) {
					reply.status(401).send({ error: 'Unauthorized' })
					return
				}

				const file = await request.file({ limits: { fileSize: 1024 * 1024 * 5 } }) // 5MB

				let url: string | null = null

				if (file) {
					const buffer = await file.toBuffer()
					url = await uploadToR2({
						key: `${Date.now()}-${file.filename}`,
						body: buffer,
						contentType: file.mimetype,
					})
				}

				const result = await prisma.recipe.update({
					where: { id: request.params.id, user: { id: user.id } },
					data: { photo: url },
				})

				reply.status(201).send(result)
			} catch (error) {
				if (error instanceof jwt.JsonWebTokenError) {
					reply.status(401).send({ error: error.message })
					return
				}

				handlePrismaError({ fastify, reply, error })
			}
		},
	)

	fastify.delete('/recipes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
		try {
			const token = request.headers.authorization?.split(' ')[1]

			if (!token) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const valid = verifyToken({ token })

			if (!valid?.email) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const user = await prisma.user.findUnique({ where: { email: valid.email } })

			if (!user) {
				reply.status(401).send({ error: 'Unauthorized' })
				return
			}

			const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id } })

			if (!recipe) {
				reply.status(404).send({ error: 'Recipe not found' })
				return
			}

			if (recipe.photo) {
				const key = recipe.photo.split('/').pop()

				if (key) {
					await deleteFromR2({ key })
				}
			}

			await prisma.recipe.delete({ where: { id: request.params.id } })

			reply.status(204)
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				reply.status(401).send({ error: error.message })
				return
			}

			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.delete(
		'/recipes/:id/photo',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			try {
				const token = request.headers.authorization?.split(' ')[1]

				if (!token) {
					reply.status(401).send({ error: 'Unauthorized' })
					return
				}

				const valid = verifyToken({ token })

				if (!valid?.email) {
					reply.status(401).send({ error: 'Unauthorized' })
					return
				}

				const user = await prisma.user.findUnique({ where: { email: valid.email } })

				if (!user) {
					reply.status(401).send({ error: 'Unauthorized' })
					return
				}

				const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id, user: { id: user.id } } })

				if (!recipe) {
					reply.status(404).send({ error: 'Recipe not found' })
					return
				}

				if (recipe.photo) {
					const key = recipe.photo.split('/').pop()

					if (key) {
						await deleteFromR2({ key })
					}
				}

				reply.status(204)
			} catch (error) {
				if (error instanceof jwt.JsonWebTokenError) {
					reply.status(401).send({ error: error.message })
					return
				}

				handlePrismaError({ fastify, reply, error })
			}
		},
	)
}
