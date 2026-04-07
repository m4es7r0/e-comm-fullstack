import { z } from 'zod'

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationParams = z.infer<typeof PaginationParamsSchema>
