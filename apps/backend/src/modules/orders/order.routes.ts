import type { FastifyPluginAsync } from 'fastify'
import { CreateOrderSchema, OrderQuerySchema, UpdateOrderStatusSchema } from '@ecomm/contracts'
import { OrderService } from './order.service.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new OrderService(fastify.prisma)

  // ── POST /orders (create order — authenticated users) ─────────────
  fastify.post(
    '/orders',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const input = CreateOrderSchema.parse(request.body)
      const order = await service.create(request.user.userId, input)
      return reply.status(201).send({ data: order })
    },
  )

  // ── GET /orders ───────────────────────────────────────────────────
  // Customer: own orders. Admin: all orders.
  fastify.get(
    '/orders',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const query = OrderQuerySchema.parse(request.query)

      if (request.user.role === 'ADMIN') {
        const result = await service.findAll(query)
        return reply.send(result)
      }

      const result = await service.findByUserId(request.user.userId, query)
      return reply.send(result)
    },
  )

  // ── GET /orders/:id ───────────────────────────────────────────────
  // Customer: own order only. Admin: any order.
  fastify.get<{ Params: { id: string } }>(
    '/orders/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.role === 'ADMIN' ? undefined : request.user.userId
      const order = await service.findById(request.params.id, userId)
      return reply.send({ data: order })
    },
  )

  // ── PUT /orders/:id/status (admin only) ───────────────────────────
  fastify.put<{ Params: { id: string } }>(
    '/orders/:id/status',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      const input = UpdateOrderStatusSchema.parse(request.body)
      const order = await service.updateStatus(request.params.id, input)
      return reply.send({ data: order })
    },
  )
}

export default orderRoutes
