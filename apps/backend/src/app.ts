import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'

// Plugins
import prismaPlugin from './plugins/prisma.js'
import redisPlugin from './plugins/redis.js'
import s3Plugin from './plugins/s3.js'
import errorHandlerPlugin from './plugins/error-handler.js'

// Routes
import healthRoutes from './modules/health/health.routes.js'
import authRoutes from './modules/auth/auth.routes.js'
import userRoutes from './modules/users/user.routes.js'
import productRoutes from './modules/products/product.routes.js'
import categoryRoutes from './modules/categories/category.routes.js'
import orderRoutes from './modules/orders/order.routes.js'
import uploadRoutes from './modules/upload/upload.routes.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Decorate request with user (populated by authenticate middleware)
  app.decorateRequest('user', null)

  // ── Core plugins ────────────────────────────────────────────────
  await app.register(cors, {
    origin: [
      'http://localhost:3000', // frontend
      'http://localhost:3002', // cms
    ],
    credentials: true,
  })

  await app.register(cookie)

  // ── Custom plugins ──────────────────────────────────────────────
  await app.register(prismaPlugin)
  await app.register(redisPlugin)
  await app.register(s3Plugin)
  await app.register(errorHandlerPlugin)

  // ── Routes ──────────────────────────────────────────────────────
  await app.register(
    async function apiRoutes(api) {
      await api.register(healthRoutes)
      await api.register(authRoutes)
      await api.register(userRoutes)
      await api.register(productRoutes)
      await api.register(categoryRoutes)
      await api.register(orderRoutes)
      await api.register(uploadRoutes)
    },
    { prefix: '/api' },
  )

  return app
}
