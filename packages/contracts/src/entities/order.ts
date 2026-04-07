import { z } from 'zod'

// ── Enums ───────────────────────────────────────────────────────────

export const OrderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
])
export type OrderStatus = z.infer<typeof OrderStatusEnum>

// ── Order Item ──────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>

// ── Order ───────────────────────────────────────────────────────────

export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
})

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: OrderStatusEnum,
  totalAmount: z.number().positive(),
  shippingAddress: ShippingAddressSchema,
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Order = z.infer<typeof OrderSchema>

// ── Create Order ────────────────────────────────────────────────────

export const CreateOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
})

export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: ShippingAddressSchema,
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

// ── Update Status ───────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
})

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>

// ── Query ───────────────────────────────────────────────────────────

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  status: OrderStatusEnum.optional(),
  sort: z.enum(['createdAt', 'totalAmount']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

export type OrderQuery = z.infer<typeof OrderQuerySchema>
