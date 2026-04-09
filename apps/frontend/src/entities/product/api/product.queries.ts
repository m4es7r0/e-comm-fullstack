import { createQueryKeys } from '@ecomm/qore'
import { getProducts, getProductBySlug } from './product.actions'
import type { ProductQuery } from '@ecomm/contracts'

export const productKeys = createQueryKeys('products', (q) => ({
  list: q.scope('list').query(
    (params?: Partial<ProductQuery>) => [params] as const,
    (params) => getProducts(params),
  ),
  detail: q.scope('detail').query(
    (slug: string) => [slug] as const,
    (slug) => getProductBySlug(slug),
  ),
}))
