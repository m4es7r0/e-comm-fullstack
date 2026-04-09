import type { PrismaClient } from '@prisma/client'
import type Redis from 'ioredis'
import type { RegisterInput, LoginInput, PublicUser, JWTPayload } from '@ecomm/contracts'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { signTokenPair, verifyRefreshToken, REFRESH_TTL_SECONDS } from '../../lib/tokens.js'

const BLACKLIST_PREFIX = 'bl:'

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
  ) {}

  async register(input: RegisterInput) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (existing) {
      const error = new Error('Email already registered') as Error & { statusCode: number }
      error.statusCode = 409
      throw error
    }

    const passwordHash = await hashPassword(input.password)

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
      },
    })

    const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role }
    const tokens = signTokenPair(payload)
    const publicUser = this.toPublicUser(user)

    return { user: publicUser, ...tokens }
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      const error = new Error('Invalid email or password') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }

    const valid = await verifyPassword(input.password, user.passwordHash)

    if (!valid) {
      const error = new Error('Invalid email or password') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }

    const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role }
    const tokens = signTokenPair(payload)
    const publicUser = this.toPublicUser(user)

    return { user: publicUser, ...tokens }
  }

  async refresh(refreshToken: string) {
    // Verify token signature & expiry
    let payload: JWTPayload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      const error = new Error('Invalid or expired refresh token') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }

    // Check blacklist
    const isBlacklisted = await this.redis.exists(`${BLACKLIST_PREFIX}${refreshToken}`)
    if (isBlacklisted) {
      const error = new Error('Token has been revoked') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }

    // Blacklist the old refresh token (one-time use)
    await this.redis.set(`${BLACKLIST_PREFIX}${refreshToken}`, '1', 'EX', REFRESH_TTL_SECONDS)

    // Check user still exists
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      const error = new Error('User not found') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }

    // Issue new token pair with fresh data
    const newPayload: JWTPayload = { userId: user.id, email: user.email, role: user.role }
    const tokens = signTokenPair(newPayload)

    return { user: this.toPublicUser(user), ...tokens }
  }

  async logout(refreshToken: string) {
    // Blacklist refresh token for its remaining TTL
    await this.redis.set(`${BLACKLIST_PREFIX}${refreshToken}`, '1', 'EX', REFRESH_TTL_SECONDS)
  }

  private toPublicUser(user: any): PublicUser {
    const { passwordHash: _, ...publicUser } = user
    return publicUser
  }
}
