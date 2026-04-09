import jwt from 'jsonwebtoken'
import { JWTPayloadSchema, type JWTPayload } from '@ecomm/contracts'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'

const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_IN = '7d'

/** Seconds until refresh token expires (for Redis TTL) */
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

// ── Sign ────────────────────────────────────────────────────────────

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
}

export function signTokenPair(payload: JWTPayload) {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  }
}

// ── Verify ──────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, ACCESS_SECRET)
  return JWTPayloadSchema.parse(decoded)
}

export function verifyRefreshToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, REFRESH_SECRET)
  return JWTPayloadSchema.parse(decoded)
}
