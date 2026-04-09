import { buildApp } from '../app.js'
import type { FastifyInstance } from 'fastify'
import { signTokenPair } from '../lib/tokens.js'
import type { JWTPayload, Role } from '@ecomm/contracts'

/**
 * Create a test app instance with all plugins and routes.
 * Call app.close() in afterAll to clean up.
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp()
  await app.ready()
  return app
}

/**
 * Generate auth headers for a test user.
 */
export function authHeaders(
  overrides: Partial<JWTPayload> & { role?: Role } = {},
): { authorization: string } {
  const payload: JWTPayload = {
    userId: overrides.userId ?? 'test-user-id',
    email: overrides.email ?? 'test@example.com',
    role: overrides.role ?? 'CUSTOMER',
  }

  const { accessToken } = signTokenPair(payload)

  return {
    authorization: `Bearer ${accessToken}`,
  }
}

/**
 * Generate admin auth headers.
 */
export function adminHeaders(
  overrides: Partial<JWTPayload> = {},
): { authorization: string } {
  return authHeaders({ ...overrides, role: 'ADMIN' })
}
