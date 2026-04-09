'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { productKeys } from '@/entities/product'
import { ProductDetail } from '@/widgets/product-detail'
import { Spinner } from '@/shared/ui'

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const { data, isLoading, error } = useQuery({
    ...productKeys.detail(slug),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground mt-2">The product you are looking for does not exist.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductDetail product={data.data} />
    </div>
  )
}
