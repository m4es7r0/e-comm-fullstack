import { z } from 'zod'

// ── Base Category Schema ────────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Category = z.infer<typeof CategorySchema>

/** Category with nested children (for tree responses) */
export type CategoryTree = Category & {
  children: CategoryTree[]
  _count?: { products: number }
}

// ── Create / Update ─────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1).optional(), // auto-generated if omitted
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
})

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
