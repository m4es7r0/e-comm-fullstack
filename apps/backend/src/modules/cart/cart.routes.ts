import type { FastifyPluginAsync } from 'fastify'
import { AddToCartSchema, UpdateCartItemSchema, ShippingAddressSchema } from '@ecomm/contracts'
import { z } from 'zod'

const CheckoutSchema = z.object({
  shippingAddress: ShippingAddressSchema,
})
import { CartService } from './cart.service.js'
import { authenticate } from '../../middleware/authenticate.js'

const cartRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new CartService(fastify.prisma)

  // All cart routes require authentication
  fastify.addHook('preHandler', authenticate)

  // ── GET /cart ─────────────────────────────────────────────────────
  fastify.get('/cart', async (request, reply) => {
    const cart = await service.getCart(request.user.userId)
    return reply.send({ data: cart })
  })

  // ── POST /cart/items (add product to cart) ────────────────────────
  fastify.post('/cart/items', async (request, reply) => {
    const input = AddToCartSchema.parse(request.body)
    const cart = await service.addItem(request.user.userId, input)
    return reply.status(201).send({ data: cart })
  })

  // ── PUT /cart/items/:itemId (update quantity) ─────────────────────
  fastify.put<{ Params: { itemId: string } }>(
    '/cart/items/:itemId',
    async (request, reply) => {
      const { quantity } = UpdateCartItemSchema.parse(request.body)
      const cart = await service.updateItem(request.user.userId, request.params.itemId, quantity)
      return reply.send({ data: cart })
    },
  )

  // ── DELETE /cart/items/:itemId (remove item) ──────────────────────
  fastify.delete<{ Params: { itemId: string } }>(
    '/cart/items/:itemId',
    async (request, reply) => {
      const cart = await service.removeItem(request.user.userId, request.params.itemId)
      return reply.send({ data: cart })
    },
  )

  // ── DELETE /cart (clear all items) ────────────────────────────────
  fastify.delete('/cart', async (request, reply) => {
    const cart = await service.clear(request.user.userId)
    return reply.send({ data: cart })
  })

  // ── POST /cart/checkout (create order from cart) ──────────────────
  fastify.post('/cart/checkout', async (request, reply) => {
    const { shippingAddress } = CheckoutSchema.parse(request.body)
    const result = await service.checkout(request.user.userId, shippingAddress)
    return reply.status(201).send({ data: result })
  })
}

export default cartRoutes
