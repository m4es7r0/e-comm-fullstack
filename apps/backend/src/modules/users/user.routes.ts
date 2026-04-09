import type { FastifyPluginAsync } from 'fastify'
import {
  UpdateProfileSchema,
  ChangePasswordSchema,
  PaginationParamsSchema,
} from '@ecomm/contracts'
import { UserService } from './user.service.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new UserService(fastify.prisma)

  // ── GET /users/me ─────────────────────────────────────────────────
  fastify.get(
    '/users/me',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = await service.findById(request.user.userId)
      return reply.send({ data: user })
    },
  )

  // ── PUT /users/me ─────────────────────────────────────────────────
  fastify.put(
    '/users/me',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const input = UpdateProfileSchema.parse(request.body)
      const user = await service.updateProfile(request.user.userId, input)
      return reply.send({ data: user })
    },
  )

  // ── PUT /users/me/password ────────────────────────────────────────
  fastify.put(
    '/users/me/password',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const input = ChangePasswordSchema.parse(request.body)
      await service.changePassword(request.user.userId, input)
      return reply.send({ data: { message: 'Password changed' } })
    },
  )

  // ── GET /users (admin) ────────────────────────────────────────────
  fastify.get(
    '/users',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      const params = PaginationParamsSchema.parse(request.query)
      const result = await service.findAll(params)
      return reply.send(result)
    },
  )

  // ── GET /users/:id (admin) ────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>(
    '/users/:id',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      const user = await service.findById(request.params.id)
      return reply.send({ data: user })
    },
  )
}

export default userRoutes
