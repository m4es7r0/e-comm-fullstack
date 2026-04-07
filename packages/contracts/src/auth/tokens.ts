import { z } from 'zod'
import { RoleEnum } from '../entities/user.js'

export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: RoleEnum,
})

export type JWTPayload = z.infer<typeof JWTPayloadSchema>

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type TokenPair = z.infer<typeof TokenPairSchema>
