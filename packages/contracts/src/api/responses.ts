import { z } from 'zod'

// ── Standard API Response ───────────────────────────────────────────

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  })

export type ApiResponse<T> = {
  data: T
  meta?: Record<string, unknown>
}

// ── Error Response ──────────────────────────────────────────────────

export const ApiErrorBodySchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  status: z.number().optional(),
  details: z.record(z.unknown()).optional(),
})

export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>

// ── Paginated Response ──────────────────────────────────────────────

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
})

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}
