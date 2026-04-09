import { Suspense } from 'react'
import { ProductCatalog } from '@/widgets/product-catalog'

export const metadata = {
  title: 'Catalog',
}

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductCatalog />
      </Suspense>
    </div>
  )
}
