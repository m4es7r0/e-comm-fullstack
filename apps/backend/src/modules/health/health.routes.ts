import type { FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply) => {
    let dbStatus = 'disconnected'

    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch {
      dbStatus = 'error'
    }

    const status = dbStatus === 'connected' ? 'ok' : 'degraded'

    return reply.status(status === 'ok' ? 200 : 503).send({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
      version: '0.1.0',
    })
  })
}

export default healthRoutes
