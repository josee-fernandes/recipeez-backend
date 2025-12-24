import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import type { FastifyInstance, FastifyReply } from 'fastify'

interface IHandlePrismaErrorParams {
	fastify: FastifyInstance
	reply: FastifyReply
	error: unknown
}

export const handlePrismaError = (params: IHandlePrismaErrorParams): void => {
	const { fastify, reply, error } = params

	fastify.log.error(error)

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
