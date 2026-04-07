import { z } from 'zod'

export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  title: z.string(),
  image: z.string().optional(),
})

export type CartItem = z.infer<typeof CartItemSchema>

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  totalItems: z.number().int().min(0),
  totalPrice: z.number().min(0),
})

export type Cart = z.infer<typeof CartSchema>
