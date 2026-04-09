import type { FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply) => {
    // Check PostgreSQL
    let dbStatus: string
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch {
      dbStatus = 'error'
    }

    // Check Redis
    let redisStatus: string
    try {
      const pong = await fastify.redis.ping()
      redisStatus = pong === 'PONG' ? 'connected' : 'error'
    } catch {
      redisStatus = 'error'
    }

    // Check S3 (MinIO)
    let s3Status: string
    try {
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
