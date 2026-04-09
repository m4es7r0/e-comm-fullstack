'use client'

import { useQuery } from '@tanstack/react-query'
import { productKeys } from '@/entities/product'
import { useProductFilters, SortSelect } from '@/features/filter-products'
import { SearchBar } from '@/features/search-products'
import { ProductGrid } from './product-grid'
import { Pagination } from './pagination'

export function ProductCatalog() {
  const { filters, setFilters } = useProductFilters()

  const { data, isLoading } = useQuery({
    ...productKeys.list(filters),
  })

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-sm">
          <SearchBar />
        </div>
        <SortSelect />
      </div>

      {/* Products Grid */}
      <ProductGrid products={data?.data ?? []} isLoading={isLoading} />

      {/* Pagination */}
      {data?.meta && <Pagination meta={data.meta} onPageChange={(page) => setFilters({ page })} />}
    </div>
  )
}
