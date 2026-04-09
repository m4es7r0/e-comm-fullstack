import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp, authHeaders } from '../../test/helpers.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await createTestApp()
})

afterAll(async () => {
  await app.close()
})

describe('Auth Module', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'

  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        },
      })

      expect(res.statusCode).toBe(201)

      const body = JSON.parse(res.body)
      expect(body.data.user.email).toBe(testEmail)
      expect(body.data.user.firstName).toBe('Test')
      expect(body.data.user.role).toBe('CUSTOMER')
      expect(body.data.accessToken).toBeDefined()
      expect(body.data.user.passwordHash).toBeUndefined()

      // Refresh token should be in httpOnly cookie
      const cookies = res.cookies
      const refreshCookie = cookies.find((c: any) => c.name === 'refresh_token')
      expect(refreshCookie).toBeDefined()
      expect(refreshCookie!.httpOnly).toBe(true)
    })

    it('should reject duplicate email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      })

      expect(res.statusCode).toBe(409)
    })

    it('should reject invalid email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'not-an-email',
          password: testPassword,
        },
      })

      expect(res.statusCode).toBe(400)
    })

    it('should reject short password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'short@example.com',
          password: '123',
        },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      })

      expect(res.statusCode).toBe(200)

      const body = JSON.parse(res.body)
      expect(body.data.user.email).toBe(testEmail)
      expect(body.data.accessToken).toBeDefined()
    })

    it('should reject wrong password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testEmail,
          password: 'wrong-password',
        },
      })

      expect(res.statusCode).toBe(401)
    })

    it('should reject non-existent email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: testPassword,
        },
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens using refresh cookie', async () => {
      // First, login to get a refresh cookie
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: testEmail, password: testPassword },
      })

      const refreshCookie = loginRes.cookies.find((c: any) => c.name === 'refresh_token')

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        cookies: { refresh_token: refreshCookie!.value },
      })

      expect(res.statusCode).toBe(200)

      const body = JSON.parse(res.body)
      expect(body.data.accessToken).toBeDefined()
      expect(body.data.user.email).toBe(testEmail)
    })

    it('should reject without refresh cookie', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout and clear cookie', async () => {
      // Login first
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: testEmail, password: testPassword },
      })

      const body = JSON.parse(loginRes.body)
      const refreshCookie = loginRes.cookies.find((c: any) => c.name === 'refresh_token')

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: { authorization: `Bearer ${body.data.accessToken}` },
        cookies: { refresh_token: refreshCookie!.value },
      })

      expect(res.statusCode).toBe(200)
    })

    it('should reject without auth token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('Protected routes', () => {
    it('should reject requests without token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users/me',
      })

      expect(res.statusCode).toBe(401)
    })

    it('should accept requests with valid token', async () => {
      // Login as seeded user
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@ecomm.local', password: 'admin123' },
      })

      const { accessToken } = JSON.parse(loginRes.body).data

      const res = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: { authorization: `Bearer ${accessToken}` },
      })

      expect(res.statusCode).toBe(200)
    })
  })
})
