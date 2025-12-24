import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import Fastify from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { env } from '@/env'
import { authPlugin } from '@/plugins/auth-plugin'
import { routes } from '@/routes'

const fastify = Fastify({ logger: true })

const init = async () => {
	await fastify.register(
		fastifyPlugin(async (fastify) => {
			fastify.register(fastifyCors, {
				origin: (origin, cb) => {
					const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173']

					if (!origin || allowedOrigins.includes(origin)) {
						cb(null, true)
						return
					}
					cb(new Error('Not allowed by CORS'), false)
				},
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization'],
				credentials: true,
			})
		}),
	)
	await fastify.register(fastifyPlugin(fastifyMultipart))
	await fastify.register(authPlugin)
	await fastify.register(routes)

	try {
		await fastify.listen({ port: env.PORT, host: env.HOST })
		fastify.log.info(`🟢 Server is running on ${env.PORT}`)
	} catch (error) {
		fastify.log.error(error)
		process.exit(1)
	}
}

init()
