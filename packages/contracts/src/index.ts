// ── Entities ────────────────────────────────────────────────────────

export {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
  ProductStatusEnum,
  type Product,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductQuery,
  type ProductStatus,
} from './entities/product.js'

export {
  CategorySchema,
  CategoryTreeSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  type Category,
  type CategoryTree,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './entities/category.js'

export {
  UserSchema,
  PublicUserSchema,
  RegisterInputSchema,
  LoginInputSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  RoleEnum,
  type User,
  type PublicUser,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type Role,
} from './entities/user.js'

export {
  OrderSchema,
  OrderItemSchema,
  CreateOrderSchema,
  CreateOrderItemSchema,
  UpdateOrderStatusSchema,
  OrderQuerySchema,
  OrderStatusEnum,
  ShippingAddressSchema,
  type Order,
  type OrderItem,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type OrderQuery,
  type OrderStatus,
  type ShippingAddress,
} from './entities/order.js'

export {
  CartItemSchema,
  CartSchema,
  type CartItem,
  type Cart,
} from './entities/cart.js'

// ── API ─────────────────────────────────────────────────────────────

export {
  ApiResponseSchema,
  ApiErrorBodySchema,
  PaginationMetaSchema,
  type ApiResponse,
  type ApiErrorBody,
  type PaginationMeta,
  type PaginatedResponse,
} from './api/responses.js'

export {
  PaginationParamsSchema,
  type PaginationParams,
} from './api/pagination.js'

export { ENDPOINTS } from './api/endpoints.js'

// ── Auth ────────────────────────────────────────────────────────────

export {
  JWTPayloadSchema,
  TokenPairSchema,
  type JWTPayload,
  type TokenPair,
} from './auth/tokens.js'

// ── UI Contracts ────────────────────────────────────────────────────

export type {
  UIState,
  UIActions,
  UIContract,
  ListMeta,
  ListState,
  ListContract,
  FieldError,
  FormState,
  FormContract,
  BaseEntity,
} from './ui/contracts.js'
