import { z } from 'zod'

// ── Enums ───────────────────────────────────────────────────────────

export const RoleEnum = z.enum(['CUSTOMER', 'ADMIN'])
export type Role = z.infer<typeof RoleEnum>

// ── User Schemas ────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  role: RoleEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

/** Public user (no passwordHash) — used in API responses */
export const PublicUserSchema = UserSchema.omit({ passwordHash: true })
export type PublicUser = z.infer<typeof PublicUserSchema>

// ── Auth Inputs ─────────────────────────────────────────────────────

export const RegisterInputSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
})

export type RegisterInput = z.infer<typeof RegisterInputSchema>

export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof LoginInputSchema>

// ── Profile Update ──────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
