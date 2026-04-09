import type { PrismaClient } from '@prisma/client'
import type {
  CreateOrderInput,
  OrderQuery,
  UpdateOrderStatusInput,
  PaginatedResponse,
  Order,
} from '@ecomm/contracts'
import { paginateQuery, buildPaginationMeta, buildOrderBy } from '../../lib/pagination.js'

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create order with atomic transaction:
   * 1. Validate all products exist, are ACTIVE, and have sufficient stock
   * 2. Calculate totalAmount from DB prices (never trust client)
   * 3. Decrement stock
   * 4. Create order + order items
   */
  async create(userId: string, input: CreateOrderInput): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch products and validate
      const productIds = input.items.map((i) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true, price: true, stock: true, status: true },
      })

      // Check all products found
      const foundIds = new Set(products.map((p) => p.id))
      const missingIds = productIds.filter((id) => !foundIds.has(id))
      if (missingIds.length > 0) {
        throw Object.assign(new Error(`Products not found: ${missingIds.join(', ')}`), {
          statusCode: 400,
        })
      }

      // Check all products active
      const inactive = products.filter((p) => p.status !== 'ACTIVE')
      if (inactive.length > 0) {
        throw Object.assign(
          new Error(`Products not available: ${inactive.map((p) => p.title).join(', ')}`),
          { statusCode: 400 },
        )
      }

      // Check stock availability
      const productMap = new Map(products.map((p) => [p.id, p]))
      for (const item of input.items) {
        const product = productMap.get(item.productId)!
        if (product.stock < item.quantity) {
          throw Object.assign(
            new Error(`Insufficient stock for "${product.title}": available ${product.stock}, requested ${item.quantity}`),
            { statusCode: 400 },
          )
        }
      }

      // 2. Calculate total from DB prices
      let totalAmount = 0
      const orderItemsData = input.items.map((item) => {
        const product = productMap.get(item.productId)!
        const price = Number(product.price)
        totalAmount += price * item.quantity
        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
        }
      })

      // 3. Decrement stock for each product
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // 4. Create order with items
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: input.shippingAddress,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: { select: { id: true, title: true, slug: true, images: true } } },
          },
        },
      })

      return this.serialize(order)
    })
  }

  /** Get orders for a specific user (customer view) */
  async findByUserId(userId: string, query: OrderQuery): Promise<PaginatedResponse<Order>> {
    const where = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        ...paginateQuery(query),
        orderBy: buildOrderBy(query.sort, query.direction),
        include: {
          items: {
            include: { product: { select: { id: true, title: true, slug: true, images: true } } },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      data: items.map(this.serialize),
      meta: buildPaginationMeta(total, query),
    }
  }

  /** Get all orders (admin view) */
  async findAll(query: OrderQuery): Promise<PaginatedResponse<Order>> {
    const where = query.status ? { status: query.status } : {}

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        ...paginateQuery(query),
        orderBy: buildOrderBy(query.sort, query.direction),
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: {
            include: { product: { select: { id: true, title: true, slug: true, images: true } } },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      data: items.map(this.serialize),
      meta: buildPaginationMeta(total, query),
    }
  }

  /** Get order by ID (checks ownership for customers) */
  async findById(id: string, userId?: string): Promise<Order> {
    const where = userId ? { id, userId } : { id }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: {
          include: { product: { select: { id: true, title: true, slug: true, images: true } } },
        },
      },
    })

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 })
    }

    return this.serialize(order)
  }

  /** Update order status (admin only) */
  async updateStatus(id: string, input: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: input.status },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: {
          include: { product: { select: { id: true, title: true, slug: true, images: true } } },
        },
      },
    })

    return this.serialize(order)
  }

  /** Convert Prisma Decimal fields to numbers */
  private serialize(order: any): Order {
    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items?.map((item: any) => ({
        ...item,
        price: Number(item.price),
      })),
    }
  }
}
