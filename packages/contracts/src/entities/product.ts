import { z } from 'zod'

// ── Base Product Schema ─────────────────────────────────────────────

export const ProductStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])
export type ProductStatus = z.infer<typeof ProductStatusEnum>

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1),
  description: z.string(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().nullable().optional(),
  currency: z.string().default('USD'),
  images: z.array(z.string()),
  categoryId: z.string(),
  status: ProductStatusEnum,
  stock: z.number().int().min(0),
  attributes: z.record(z.string(), z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>

// ── Create / Update ─────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1).optional(), // auto-generated if omitted
  description: z.string().default(''),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().nullable().optional(),
  currency: z.string().default('USD'),
  images: z.array(z.string()).default([]),
  categoryId: z.string().min(1, 'Category is required'),
  status: ProductStatusEnum.default('DRAFT'),
  stock: z.number().int().min(0).default(0),
  attributes: z.record(z.string(), z.string()).default({}),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = CreateProductSchema.partial()

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

// ── Query Params ────────────────────────────────────────────────────

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['price', 'title', 'createdAt', 'stock']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  categoryId: z.string().optional(),
  status: ProductStatusEnum.optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
})

export type ProductQuery = z.infer<typeof ProductQuerySchema>
