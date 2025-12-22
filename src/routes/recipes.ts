import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { type Prisma, prisma } from '@/lib/prisma'
import { deleteFromR2, uploadToR2 } from '@/lib/r2'
import { assertAuthenticated } from '@/utils/assert-authenticated'
import { handlePrismaError } from '@/utils/prisma'

const recipesQuerySchema = z.object({
	pageIndex: z.coerce.number().default(0),
	recipeId: z.string().optional(),
	recipeName: z.string().optional(),
})

type TRecipesQuery = z.infer<typeof recipesQuerySchema>

export const recipesRoutes = async (fastify: FastifyInstance) => {
	fastify.get('/recipes', async (request: FastifyRequest<{ Querystring: TRecipesQuery }>, reply: FastifyReply) => {
		try {
			assertAuthenticated(request)

			const { pageIndex, recipeId, recipeName } = recipesQuerySchema.parse(request.query)

			const perPage = 10

			const [recipes, totalCount] = await prisma.$transaction([
				prisma.recipe.findMany({
					include: { user: { select: { id: true, email: true, name: true, createdAt: true, updatedAt: true } } },
					where: {
						...(recipeId && { id: recipeId }),
						...(recipeName && { title: { contains: recipeName } }),
					},
					skip: pageIndex * perPage,
					take: perPage,
				}),
				prisma.recipe.count({
					where: {
						...(recipeId && { id: recipeId }),
						...(recipeName && { title: { contains: recipeName } }),
					},
				}),
			])

			const result = {
				recipes,
				meta: {
					pageIndex,
					perPage,
					totalCount,
				},
			}

			reply.status(200).send(result)
		} catch (error) {
			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.get('/recipes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
		try {
			assertAuthenticated(request)

			const result = await prisma.recipe.findUnique({
				where: { id: request.params.id },
				include: { user: { select: { id: true, email: true, name: true, createdAt: true, updatedAt: true } } },
			})

			if (!result) {
				reply.status(404).send({ error: 'Recipe not found' })
				return
			}

			reply.status(200).send(result)
		} catch (error) {
			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.post('/recipes', async (request: FastifyRequest<{ Body: Prisma.RecipeCreateInput }>, reply: FastifyReply) => {
		try {
			assertAuthenticated(request)

			const data: Prisma.RecipeCreateInput = {
				...request.body,
				user: {
					connect: {
						id: request.user.id,
					},
				},
			}

			const result = await prisma.recipe.create({ data })

			reply.status(201).send(result)
		} catch (error) {
			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.post(
		'/recipes/:id/photo',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			try {
				assertAuthenticated(request)

				const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id } })

				if (!recipe) {
					reply.status(404).send({ error: 'Recipe not found' })
					return
				}

				const file = await request.file({ limits: { fileSize: 1024 * 1024 * 5 } })

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
					where: { id: request.params.id },
					data: { photo: url },
				})

				reply.status(201).send(result)
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)

	fastify.put(
		'/recipes/:id',
		async (
			request: FastifyRequest<{ Params: { id: string }; Body: Prisma.RecipeUpdateInput }>,
			reply: FastifyReply,
		) => {
			try {
				assertAuthenticated(request)

				const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id } })

				if (!recipe) {
					reply.status(404).send({ error: 'Recipe not found' })
					return
				}

				const data: Prisma.RecipeUpdateInput = {
					...request.body,
				}

				const result = await prisma.recipe.update({ where: { id: request.params.id }, data })

				reply.status(200).send(result)
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)

	fastify.put(
		'/recipes/:id/photo',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			try {
				assertAuthenticated(request)

				const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id } })

				if (!recipe) {
					reply.status(404).send({ error: 'Recipe not found' })
					return
				}

				const file = await request.file({ limits: { fileSize: 1024 * 1024 * 5 } })

				let url: string | null = null

				if (file) {
					const buffer = await file.toBuffer()
					url = await uploadToR2({
						key: `${Date.now()}-${file.filename}`,
						body: buffer,
						contentType: file.mimetype,
					})

					// Deletar foto antiga se existir
					if (recipe.photo) {
						const key = recipe.photo.split('/').pop()

						if (key) {
							await deleteFromR2({ key })
						}
					}
				}

				const result = await prisma.recipe.update({
					where: { id: request.params.id },
					data: { photo: url },
				})

				reply.status(200).send(result)
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)

	fastify.delete('/recipes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
		try {
			assertAuthenticated(request)

			const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id } })

			if (!recipe) {
				reply.status(404).send({ error: 'Recipe not found' })
				return
			}

			// Deletar foto se existir
			if (recipe.photo) {
				const key = recipe.photo.split('/').pop()

				if (key) {
					await deleteFromR2({ key })
				}
			}

			await prisma.recipe.delete({ where: { id: request.params.id } })

			reply.status(204).send()
		} catch (error) {
			handlePrismaError({ fastify, reply, error })
		}
	})

	fastify.delete(
		'/recipes/:id/photo',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			try {
				assertAuthenticated(request)

				const recipe = await prisma.recipe.findUnique({ where: { id: request.params.id } })

				if (!recipe) {
					reply.status(404).send({ error: 'Recipe not found' })
					return
				}

				// Deletar foto do R2 se existir
				if (recipe.photo) {
					const key = recipe.photo.split('/').pop()

					if (key) {
						await deleteFromR2({ key })
					}
				}

				// Atualizar campo photo para null no banco
				await prisma.recipe.update({
					where: { id: request.params.id },
					data: { photo: null },
				})

				reply.status(204).send()
			} catch (error) {
				handlePrismaError({ fastify, reply, error })
			}
		},
	)
}
