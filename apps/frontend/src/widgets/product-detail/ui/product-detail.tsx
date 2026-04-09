'use client'

import Image from 'next/image'
import type { Product } from '@ecomm/contracts'
import { Badge } from '@/shared/ui'
import { formatPrice, getImageUrl } from '@/shared/lib'
import { AddToCartButton } from '@/features/add-to-cart'
import { env } from '@/shared/config'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const mainImage = getImageUrl(product.images?.[0], env.S3_URL)

  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <div
                key={i}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted"
              >
                <Image
                  src={getImageUrl(img, env.S3_URL)}
                  alt={`${product.title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
            {hasDiscount && (
              <Badge variant="destructive">
                -{Math.round((1 - product.price / product.compareAtPrice!) * 100)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-2">
          {product.stock > 0 ? (
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">{product.stock} in stock</Badge>
          ) : (
            <Badge variant="destructive">Out of stock</Badge>
          )}
        </div>

        {/* Add to Cart */}
        <AddToCartButton productId={product.id} stock={product.stock} />

        {/* Description */}
        {product.description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
