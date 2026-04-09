import type { FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply) => {
    let dbStatus = 'disconnected'
    let redisStatus = 'disconnected'
    let s3Status = 'disconnected'

    // Check PostgreSQL
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch {
      dbStatus = 'error'
    }

    // Check Redis
    try {
      const pong = await fastify.redis.ping()
      redisStatus = pong === 'PONG' ? 'connected' : 'error'
    } catch {
      redisStatus = 'error'
    }

    // Check S3 (MinIO)
    try {
      // s3 plugin ensures bucket on startup; just check it's decorated
      s3Status = fastify.s3 ? 'connected' : 'error'
    } catch {
      s3Status = 'error'
    }

    const allHealthy = dbStatus === 'connected' && redisStatus === 'connected' && s3Status === 'connected'
    const status = allHealthy ? 'ok' : 'degraded'

    return reply.status(allHealthy ? 200 : 503).send({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        s3: s3Status,
      },
      version: '0.1.0',
    })
  })
}

export default healthRoutes
