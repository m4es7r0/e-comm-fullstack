'use client'

import { useProductFilters } from '../model/use-product-filters'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Oldest', value: 'createdAt:asc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Name: A-Z', value: 'title:asc' },
  { label: 'Name: Z-A', value: 'title:desc' },
]

export function SortSelect() {
  const { filters, setFilters } = useProductFilters()
  const currentValue = `${filters.sort ?? 'createdAt'}:${filters.direction ?? 'desc'}`

  return (
    <select
      value={currentValue}
      onChange={(e) => {
        const [sort, direction] = e.target.value.split(':')
        setFilters({ sort: sort as any, direction: direction as any })
      }}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
