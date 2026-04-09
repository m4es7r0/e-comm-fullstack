import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp } from '../../test/helpers.js'

let app: FastifyInstance
let adminToken: string
let customerToken: string

beforeAll(async () => {
  app = await createTestApp()

  const adminRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'admin@ecomm.local', password: 'admin123' },
  })
  adminToken = JSON.parse(adminRes.body).data.accessToken

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

describe('Orders Module', () => {
  describe('POST /api/orders', () => {
    it('should create order and reduce stock', async () => {
      // Get a product first
      const prodRes = await app.inject({
        method: 'GET',
        url: '/api/products/premium-cotton-tshirt',
      })
      const product = JSON.parse(prodRes.body).data
      const stockBefore = product.stock

      const res = await app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: { authorization: `Bearer ${customerToken}` },
        payload: {
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Test St',
            city: 'TestCity',
            postalCode: '12345',
            country: 'US',
          },
        },
      })

      expect(res.statusCode).toBe(201)

      const body = JSON.parse(res.body)
      expect(body.data.totalAmount).toBe(product.price * 2)
      expect(body.data.status).toBe('PENDING')
      expect(body.data.items).toHaveLength(1)

      // Verify stock was reduced
      const prodAfterRes = await app.inject({
        method: 'GET',
        url: '/api/products/premium-cotton-tshirt',
      })
      const stockAfter = JSON.parse(prodAfterRes.body).data.stock
      expect(stockAfter).toBe(stockBefore - 2)
    })

    it('should reject order for out-of-stock product', async () => {
      // Dell XPS 15 has stock=0 and status=DRAFT
      const prodRes = await app.inject({
        method: 'GET',
        url: '/api/products/dell-xps-15',
      })
      const product = JSON.parse(prodRes.body).data

      const res = await app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: { authorization: `Bearer ${customerToken}` },
        payload: {
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Test St',
            city: 'TestCity',
            postalCode: '12345',
            country: 'US',
          },
        },
      })

      expect(res.statusCode).toBe(400)
    })

    it('should reject without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          items: [{ productId: 'some-id', quantity: 1 }],
          shippingAddress: {
            firstName: 'X',
            lastName: 'Y',
            address: '1',
            city: '2',
            postalCode: '3',
            country: 'US',
          },
        },
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/orders', () => {
    it('should return customer own orders', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/orders',
        headers: { authorization: `Bearer ${customerToken}` },
      })

      expect(res.statusCode).toBe(200)

      const body = JSON.parse(res.body)
      expect(body.data).toBeInstanceOf(Array)
      expect(body.data.length).toBeGreaterThan(0)
    })

    it('should return all orders for admin', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/orders',
        headers: { authorization: `Bearer ${adminToken}` },
      })

      expect(res.statusCode).toBe(200)

      const body = JSON.parse(res.body)
      expect(body.data.length).toBeGreaterThan(0)
    })
  })

  describe('PUT /api/orders/:id/status (admin)', () => {
    it('should update order status as admin', async () => {
      // Get an order ID
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/orders',
        headers: { authorization: `Bearer ${adminToken}` },
      })
      const orderId = JSON.parse(listRes.body).data[0].id

      const res = await app.inject({
        method: 'PUT',
        url: `/api/orders/${orderId}/status`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'CONFIRMED' },
      })

      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).data.status).toBe('CONFIRMED')
    })

    it('should reject status update for customer', async () => {
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/orders',
        headers: { authorization: `Bearer ${customerToken}` },
      })
      const orderId = JSON.parse(listRes.body).data[0].id

      const res = await app.inject({
        method: 'PUT',
        url: `/api/orders/${orderId}/status`,
        headers: { authorization: `Bearer ${customerToken}` },
        payload: { status: 'SHIPPED' },
      })

      expect(res.statusCode).toBe(403)
    })
  })
})
