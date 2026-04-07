import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'

// Plugins
import prismaPlugin from './plugins/prisma.js'
import errorHandlerPlugin from './plugins/error-handler.js'

// Routes
import healthRoutes from './modules/health/health.routes.js'
import productRoutes from './modules/products/product.routes.js'
import categoryRoutes from './modules/categories/category.routes.js'

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
  await app.register(errorHandlerPlugin)

  // ── Routes ──────────────────────────────────────────────────────
  await app.register(
    async function apiRoutes(api) {
      await api.register(healthRoutes)
      await api.register(productRoutes)
      await api.register(categoryRoutes)
    },
    { prefix: '/api' },
  )

  return app
}
