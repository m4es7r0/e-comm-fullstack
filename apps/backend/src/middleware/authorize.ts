import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Role } from '@ecomm/contracts'

/**
 * Factory for preHandler hook — checks if authenticated user has one of the allowed roles.
 * Must be used AFTER `authenticate` middleware.
 */
export function authorize(...roles: Role[]) {
  return async function authorizeHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
        status: 401,
      })
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        status: 403,
      })
    }
  }
}
