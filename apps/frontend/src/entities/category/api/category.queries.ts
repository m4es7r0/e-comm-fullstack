import { createQueryKeys } from '@ecomm/qore'
import { getCategories, getCategoryBySlug, getCategoryProducts } from './category.actions'
import type { ProductQuery } from '@ecomm/contracts'

export const categoryKeys = createQueryKeys('categories', (q) => ({
  list: q.scope('list').query(() => getCategories()),
  detail: q.scope('detail').query(
    (slug: string) => [slug] as const,
    (slug) => getCategoryBySlug(slug),
  ),
  products: q.scope('products').query(
    (slug: string, params?: Partial<ProductQuery>) => [slug, params] as const,
    (slug, params) => getCategoryProducts(slug, params),
  ),
}))
