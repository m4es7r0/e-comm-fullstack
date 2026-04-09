'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/shared/ui'
import { useProductFilters } from '@/features/filter-products'

export function SearchBar() {
  const { filters, setFilters } = useProductFilters()
  const [value, setValue] = useState(filters.search ?? '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: value || undefined })
    }, 400)
    return () => clearTimeout(timer)
  }, [value, setFilters])

  // Sync external changes
  useEffect(() => {
    setValue(filters.search ?? '')
  }, [filters.search])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search products..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
