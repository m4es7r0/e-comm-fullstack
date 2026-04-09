import { z } from 'zod'

// ── Cart Item (response — includes product info) ────────────────────

export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  product: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().nullable(),
    images: z.array(z.string()),
    stock: z.number().int().min(0),
    status: z.string(),
  }),
})

export type CartItem = z.infer<typeof CartItemSchema>

// ── Cart (full response) ────────────────────────────────────────────

export const CartSchema = z.object({
  id: z.string(),
  items: z.array(CartItemSchema),
  totalItems: z.number().int().min(0),
  totalPrice: z.number().min(0),
})

export type Cart = z.infer<typeof CartSchema>

// ── Mutations ───────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
})

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
