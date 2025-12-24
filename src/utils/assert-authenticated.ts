import type { FastifyRequest } from 'fastify'

interface IAuthenticatedUser {
	id: string
	email: string
	name: string
}

export function assertAuthenticated(request: FastifyRequest): asserts request is FastifyRequest & {
	user: IAuthenticatedUser
} {
	if (!request.user) {
		throw new Error('Unauthorized')
	}
}
