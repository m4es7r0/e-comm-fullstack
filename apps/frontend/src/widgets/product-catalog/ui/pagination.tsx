'use client'

import { Button } from '@/shared/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@ecomm/contracts'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(meta.total / meta.perPage)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button
        variant="outline"
        size="icon"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {meta.page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={meta.page >= totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
