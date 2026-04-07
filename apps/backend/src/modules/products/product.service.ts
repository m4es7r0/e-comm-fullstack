import type { PrismaClient, Prisma } from '@prisma/client'
import type { CreateProductInput, UpdateProductInput, ProductQuery, PaginatedResponse, Product } from '@ecomm/contracts'
import { paginateQuery, buildPaginationMeta, buildOrderBy } from '../../lib/pagination.js'
import { generateSlug, ensureUniqueSlug } from '../../lib/slugify.js'

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async findAll(query: ProductQuery): Promise<PaginatedResponse<Product>> {
    const where: Prisma.ProductWhereInput = {}

    if (query.categoryId) where.categoryId = query.categoryId
    if (query.status) where.status = query.status
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' }
    }
    if (query.minPrice || query.maxPrice) {
      where.price = {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        ...paginateQuery(query),
        orderBy: buildOrderBy(query.sort, query.direction),
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      this.prisma.product.count({ where }),
    ])

    return {
      data: items.map(this.serialize),
      meta: buildPaginationMeta(total, query),
    }
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { slug },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    return this.serialize(product)
  }

  async findById(id: string): Promise<Product> {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    return this.serialize(product)
  }

  async create(input: CreateProductInput): Promise<Product> {
    const slug = input.slug
      ? await ensureUniqueSlug(input.slug, 'product')
      : await ensureUniqueSlug(generateSlug(input.title), 'product')

    const product = await this.prisma.product.create({
      data: {
        ...input,
        slug,
        attributes: input.attributes ?? {},
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })

    return this.serialize(product)
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    let slug: string | undefined
    if (input.slug) {
      slug = await ensureUniqueSlug(input.slug, 'product', id)
    } else if (input.title) {
      slug = await ensureUniqueSlug(generateSlug(input.title), 'product', id)
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...input,
        ...(slug ? { slug } : {}),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })

    return this.serialize(product)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } })
  }

  /** Convert Prisma Decimal fields to numbers for JSON response */
  private serialize(product: any): Product {
    return {
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    }
  }
}
