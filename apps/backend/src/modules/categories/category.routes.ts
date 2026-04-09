import type { FastifyPluginAsync } from 'fastify'
import { CreateCategorySchema, UpdateCategorySchema, ProductQuerySchema } from '@ecomm/contracts'
import { CategoryService } from './category.service.js'
import { ProductService } from '../products/product.service.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'

const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new CategoryService(fastify.prisma)
  const productService = new ProductService(fastify.prisma)

  // ── GET /categories ───────────────────────────────────────────────
  fastify.get('/categories', async (_request, reply) => {
    const categories = await service.findAll()
    return reply.send({ data: categories })
  })

  // ── GET /categories/:slug ─────────────────────────────────────────
  fastify.get<{ Params: { slug: string } }>('/categories/:slug', async (request, reply) => {
    const category = await service.findBySlug(request.params.slug)
    return reply.send({ data: category })
  })

  // ── GET /categories/:slug/products ────────────────────────────────
  fastify.get<{ Params: { slug: string } }>('/categories/:slug/products', async (request, reply) => {
    const category = await service.findBySlug(request.params.slug)
    const query = ProductQuerySchema.parse({ ...(request.query as any), categoryId: category.id })
    const result = await productService.findAll(query)
    return reply.send(result)
  })

  // ── POST /categories (admin) ──────────────────────────────────────
  fastify.post(
    '/categories',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      const input = CreateCategorySchema.parse(request.body)
      const category = await service.create(input)
      return reply.status(201).send({ data: category })
    },
  )

  // ── PUT /categories/:id (admin) ───────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    '/categories/:id',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      const input = UpdateCategorySchema.parse(request.body)
      const category = await service.update(request.params.id, input)
      return reply.send({ data: category })
    },
  )

  // ── DELETE /categories/:id (admin) ────────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    '/categories/:id',
    { preHandler: [authenticate, authorize('ADMIN')] },
    async (request, reply) => {
      await service.delete(request.params.id)
      return reply.status(204).send()
    },
  )
}

export default categoryRoutes
