import type { FastifyPluginAsync } from 'fastify'
import { RegisterInputSchema, LoginInputSchema } from '@ecomm/contracts'
import { AuthService } from './auth.service.js'
import { authenticate } from '../../middleware/authenticate.js'

const REFRESH_COOKIE = 'refresh_token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new AuthService(fastify.prisma, fastify.redis)

  // ── POST /auth/register ───────────────────────────────────────────
  fastify.post('/auth/register', async (request, reply) => {
    const input = RegisterInputSchema.parse(request.body)
    const { user, accessToken, refreshToken } = await service.register(input)

    reply.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)

    return reply.status(201).send({
      data: { user, accessToken },
    })
  })

  // ── POST /auth/login ──────────────────────────────────────────────
  fastify.post('/auth/login', async (request, reply) => {
    const input = LoginInputSchema.parse(request.body)
    const { user, accessToken, refreshToken } = await service.login(input)

    reply.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)

    return reply.status(200).send({
      data: { user, accessToken },
    })
  })

  // ── POST /auth/refresh ────────────────────────────────────────────
  fastify.post('/auth/refresh', async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE]

    if (!refreshToken) {
      return reply.status(401).send({
        message: 'Refresh token required',
        code: 'UNAUTHORIZED',
        status: 401,
      })
    }

    const { user, accessToken, refreshToken: newRefreshToken } = await service.refresh(refreshToken)

    reply.setCookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTIONS)

    return reply.send({
      data: { user, accessToken },
    })
  })

  // ── POST /auth/logout ─────────────────────────────────────────────
  fastify.post(
    '/auth/logout',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const refreshToken = request.cookies[REFRESH_COOKIE]

      if (refreshToken) {
        await service.logout(refreshToken)
      }

      reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })

      return reply.send({ data: { message: 'Logged out' } })
    },
  )
}

export default authRoutes
