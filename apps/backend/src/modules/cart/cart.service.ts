import type { PrismaClient } from '@prisma/client'
import type { Cart, AddToCartInput } from '@ecomm/contracts'

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          images: true,
          stock: true,
          status: true,
        },
      },
    },
    orderBy: { id: 'asc' as const },
  },
} as const

export class CartService {
  constructor(private prisma: PrismaClient) {}

  /** Get or create cart for user, returns serialized Cart */
  async getCart(userId: string): Promise<Cart> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: CART_INCLUDE,
    })

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: CART_INCLUDE,
      })
    }

    return this.serialize(cart)
  }

  /** Add product to cart (or increment quantity if already exists) */
  async addItem(userId: string, input: AddToCartInput): Promise<Cart> {
    // Validate product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true, status: true, stock: true, title: true },
    })

    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 })
    }

    if (product.status !== 'ACTIVE') {
      throw Object.assign(new Error(`Product "${product.title}" is not available`), {
        statusCode: 400,
      })
    }

    // Ensure cart exists
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    })

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: input.productId } },
    })

    const newQuantity = existingItem
      ? existingItem.quantity + input.quantity
      : input.quantity

    // Validate stock
    if (newQuantity > product.stock) {
      throw Object.assign(
        new Error(
          `Insufficient stock for "${product.title}": available ${product.stock}, requested ${newQuantity}`,
        ),
        { statusCode: 400 },
      )
    }

    // Upsert cart item
    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: input.productId } },
      create: { cartId: cart.id, productId: input.productId, quantity: input.quantity },
      update: { quantity: newQuantity },
    })

    return this.getCart(userId)
  }

  /** Update quantity of a specific cart item */
  async updateItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const item = await this.findUserCartItem(userId, itemId)

    // Validate stock
    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
      select: { stock: true, title: true },
    })

    if (product && quantity > product.stock) {
      throw Object.assign(
        new Error(
          `Insufficient stock for "${product.title}": available ${product.stock}, requested ${quantity}`,
        ),
        { statusCode: 400 },
      )
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    return this.getCart(userId)
  }

  /** Remove a specific item from cart */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    await this.findUserCartItem(userId, itemId)

    await this.prisma.cartItem.delete({ where: { id: itemId } })

    return this.getCart(userId)
  }

  /** Clear all items from cart */
  async clear(userId: string): Promise<Cart> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } })

    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    return this.getCart(userId)
  }

  /** Checkout: create order from cart contents, then clear cart */
  async checkout(
    userId: string,
    shippingAddress: Record<string, unknown>,
  ): Promise<{ orderId: string }> {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true, price: true, stock: true, status: true } },
            },
          },
        },
      })

      if (!cart || cart.items.length === 0) {
        throw Object.assign(new Error('Cart is empty'), { statusCode: 400 })
      }

      // Validate all products still active and in stock
      let totalAmount = 0
      const orderItemsData: { productId: string; quantity: number; price: number }[] = []

      for (const item of cart.items) {
        const { product } = item

        if (product.status !== 'ACTIVE') {
          throw Object.assign(
            new Error(`Product "${product.title}" is no longer available`),
            { statusCode: 400 },
          )
        }

        if (item.quantity > product.stock) {
          throw Object.assign(
            new Error(
              `Insufficient stock for "${product.title}": available ${product.stock}, in cart ${item.quantity}`,
            ),
            { statusCode: 400 },
          )
        }

        const price = Number(product.price)
        totalAmount += price * item.quantity
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price,
        })
      }

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: shippingAddress as any,
          items: { create: orderItemsData },
        },
      })

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return { orderId: order.id }
    })
  }

  // ── Private helpers ─────────────────────────────────────────────

  /** Find cart item and verify it belongs to user's cart */
  private async findUserCartItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { select: { userId: true } } },
    })

    if (!item || item.cart.userId !== userId) {
      throw Object.assign(new Error('Cart item not found'), { statusCode: 404 })
    }

    return item
  }

  /** Serialize Prisma cart to Cart contract type */
  private serialize(cart: any): Cart {
    const items = cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        ...item.product,
        price: Number(item.product.price),
        compareAtPrice: item.product.compareAtPrice
          ? Number(item.product.compareAtPrice)
          : null,
      },
    }))

    const totalItems = items.reduce((sum: number, i: any) => sum + i.quantity, 0)
    const totalPrice = items.reduce(
      (sum: number, i: any) => sum + i.product.price * i.quantity,
      0,
    )

    return {
      id: cart.id,
      items,
      totalItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
    }
  }
}
