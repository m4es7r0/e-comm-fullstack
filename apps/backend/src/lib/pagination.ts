import type { PaginationParams, PaginationMeta } from '@ecomm/contracts'

/**
 * Convert pagination params to Prisma query args
 */
export function paginateQuery(params: PaginationParams) {
  const page = params.page ?? 1
  const perPage = params.perPage ?? 20

  return {
    skip: (page - 1) * perPage,
    take: perPage,
  }
}

/**
 * Build pagination meta from total count and params
 */
export function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
  const page = params.page ?? 1
  const perPage = params.perPage ?? 20

  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  }
}

/**
 * Build Prisma orderBy from sort params
 */
export function buildOrderBy(sort?: string, direction: 'asc' | 'desc' = 'desc') {
  if (!sort) return { createdAt: direction }
  return { [sort]: direction }
}
