import type { FastifyRequest, FastifyReply } from 'fastify'
import type { JWTPayload } from '@ecomm/contracts'
import { verifyAccessToken } from '../lib/tokens.js'

declare module 'fastify' {
  interface FastifyRequest {
    user: JWTPayload
  }
}

/**
 * preHandler hook — verifies JWT access token from Authorization header.
 * Decorates `request.user` with the decoded payload.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({
      message: 'Access token required',
      code: 'UNAUTHORIZED',
      status: 401,
    })
  }

  const token = header.slice(7)

  try {
    request.user = verifyAccessToken(token)
  } catch {
    return reply.status(401).send({
      message: 'Invalid or expired access token',
      code: 'TOKEN_EXPIRED',
      status: 401,
    })
  }
}
