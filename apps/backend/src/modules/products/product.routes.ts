import type { FastifyPluginAsync } from 'fastify'
import { ProductQuerySchema, CreateProductSchema, UpdateProductSchema } from '@ecomm/contracts'
import { ProductService } from './product.service.js'

const productRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new ProductService(fastify.prisma)

  // ── GET /products ─────────────────────────────────────────────────
  fastify.get('/products', async (request, reply) => {
    const query = ProductQuerySchema.parse(request.query)
    const result = await service.findAll(query)
    return reply.send(result)
  })

  // ── GET /products/:slug ───────────────────────────────────────────
  fastify.get<{ Params: { slug: string } }>('/products/:slug', async (request, reply) => {
    const product = await service.findBySlug(request.params.slug)
    return reply.send({ data: product })
  })

  // ── POST /products (admin) ────────────────────────────────────────
  fastify.post('/products', async (request, reply) => {
    // TODO: add authenticate + authorize('ADMIN') in Phase 2
    const input = CreateProductSchema.parse(request.body)
    const product = await service.create(input)
    return reply.status(201).send({ data: product })
  })

  // ── PUT /products/:id (admin) ─────────────────────────────────────
  fastify.put<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    // TODO: add authenticate + authorize('ADMIN') in Phase 2
    const input = UpdateProductSchema.parse(request.body)
    const product = await service.update(request.params.id, input)
    return reply.send({ data: product })
  })

  // ── DELETE /products/:id (admin) ──────────────────────────────────
  fastify.delete<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    // TODO: add authenticate + authorize('ADMIN') in Phase 2
    await service.delete(request.params.id)
    return reply.status(204).send()
  })
}

export default productRoutes
