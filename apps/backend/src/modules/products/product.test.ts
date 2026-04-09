import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp } from '../../test/helpers.js'

let app: FastifyInstance
let adminToken: string
let customerToken: string

beforeAll(async () => {
  app = await createTestApp()

  // Login as admin
  const adminRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'admin@ecomm.local', password: 'admin123' },
  })
  adminToken = JSON.parse(adminRes.body).data.accessToken

  // Login as customer
  const customerRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'john@example.com', password: 'user1234' },
  })
  customerToken = JSON.parse(customerRes.body).data.accessToken
})

afterAll(async () => {
  await app.close()
})

describe('Products Module', () => {
  describe('GET /api/products', () => {
    it('should return paginated products (public)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/products',
      })

      expect(res.statusCode).toBe(200)

      const body = JSON.parse(res.body)
      expect(body.data).toBeInstanceOf(Array)
      expect(body.data.length).toBeGreaterThan(0)
      expect(body.meta.page).toBe(1)
      expect(body.meta.total).toBeGreaterThan(0)
    })

    it('should filter by status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/products?status=ACTIVE',
      })

      const body = JSON.parse(res.body)
      expect(body.data.every((p: any) => p.status === 'ACTIVE')).toBe(true)
    })

    it('should search by title', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/products?search=iphone',
      })

      const body = JSON.parse(res.body)
      expect(body.data.length).toBeGreaterThan(0)
      expect(body.data[0].title.toLowerCase()).toContain('iphone')
    })

    it('should sort by price ascending', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/products?sort=price&direction=asc',
      })

      const body = JSON.parse(res.body)
      const prices = body.data.map((p: any) => p.price)
      expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b))
    })
  })

  describe('GET /api/products/:slug', () => {
    it('should return product by slug', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/products/iphone-16-pro',
      })

      expect(res.statusCode).toBe(200)

      const body = JSON.parse(res.body)
      expect(body.data.slug).toBe('iphone-16-pro')
      expect(body.data.price).toBe(999.99)
    })

    it('should return 404 for non-existent slug', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/products/non-existent-product',
      })

      expect(res.statusCode).toBe(404)
    })
  })

  describe('POST /api/products (admin)', () => {
    it('should create product as admin', async () => {
      // First get a category ID
      const catRes = await app.inject({ method: 'GET', url: '/api/categories/electronics' })
      const categoryId = JSON.parse(catRes.body).data.id

      const res = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          title: 'Test Product',
          price: 49.99,
          categoryId,
          status: 'DRAFT',
          stock: 10,
        },
      })

      expect(res.statusCode).toBe(201)

      const body = JSON.parse(res.body)
      expect(body.data.title).toBe('Test Product')
      expect(body.data.slug).toBe('test-product')
      expect(body.data.price).toBe(49.99)
    })

    it('should reject for customer', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: { authorization: `Bearer ${customerToken}` },
        payload: {
          title: 'Forbidden Product',
          price: 10,
          categoryId: 'some-id',
        },
      })

      expect(res.statusCode).toBe(403)
    })

    it('should reject without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          title: 'No Auth Product',
          price: 10,
          categoryId: 'some-id',
        },
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
