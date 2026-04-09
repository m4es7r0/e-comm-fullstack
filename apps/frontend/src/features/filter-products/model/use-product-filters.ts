'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import type { ProductQuery } from '@ecomm/contracts'

export function useProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: Partial<ProductQuery> = useMemo(() => {
    const sp = searchParams ?? new URLSearchParams()
    return {
      page: Number(sp.get('page')) || 1,
      perPage: Number(sp.get('perPage')) || 12,
      search: sp.get('search') ?? undefined,
      categoryId: sp.get('categoryId') ?? undefined,
      status: (sp.get('status') as ProductQuery['status']) ?? undefined,
      minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      sort: (sp.get('sort') as ProductQuery['sort']) ?? 'createdAt',
      direction: (sp.get('direction') as ProductQuery['direction']) ?? 'desc',
    }
  }, [searchParams])

  const setFilters = useCallback(
    (updates: Partial<ProductQuery>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      // Reset to page 1 on filter change (unless page itself is changing)
      if (!('page' in updates)) {
        params.delete('page')
      }

      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  const resetFilters = useCallback(() => {
    router.push('?')
  }, [router])

  return { filters, setFilters, resetFilters }
}
