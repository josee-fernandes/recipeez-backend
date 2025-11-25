import fastifyMultipart from '@fastify/multipart'
import Fastify from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { env } from '@/env'
import { routes } from '@/routes'

const fastify = Fastify({ logger: true })

const init = async () => {
	await fastify.register(fastifyPlugin(fastifyMultipart))
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
