import type { PrismaClient } from '@prisma/client'
import type { CreateCategoryInput, UpdateCategoryInput, Category, CategoryTree } from '@ecomm/contracts'
import { generateSlug, ensureUniqueSlug } from '../../lib/slugify.js'

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  /** Get all categories as a tree (top-level with nested children) */
  async findAll(): Promise<CategoryTree[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    })

    return categories as unknown as CategoryTree[]
  }

  /** Get a single category by slug with children and product count */
  async findBySlug(slug: string): Promise<CategoryTree> {
    const category = await this.prisma.category.findUniqueOrThrow({
      where: { slug },
      include: {
        children: {
          include: { _count: { select: { products: true } } },
        },
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    })

    return category as unknown as CategoryTree
  }

  async findById(id: string): Promise<Category> {
    return this.prisma.category.findUniqueOrThrow({
      where: { id },
      include: { parent: { select: { id: true, name: true, slug: true } } },
    }) as unknown as Category
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug
      ? await ensureUniqueSlug(input.slug, 'category')
      : await ensureUniqueSlug(generateSlug(input.name), 'category')

    const category = await this.prisma.category.create({
      data: { ...input, slug },
    })

    return category as unknown as Category
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    let slug: string | undefined
    if (input.slug) {
      slug = await ensureUniqueSlug(input.slug, 'category', id)
    } else if (input.name) {
      slug = await ensureUniqueSlug(generateSlug(input.name), 'category', id)
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: { ...input, ...(slug ? { slug } : {}) },
    })

    return category as unknown as Category
  }

  async delete(id: string): Promise<void> {
    // Check for associated products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    })

    if (productCount > 0) {
      const error = new Error(`Cannot delete category: ${productCount} products are associated`)
      ;(error as any).statusCode = 409
      throw error
    }

    await this.prisma.category.delete({ where: { id } })
  }
}
