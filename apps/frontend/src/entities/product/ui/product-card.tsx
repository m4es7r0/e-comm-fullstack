import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@ecomm/contracts'
import { Card, CardContent, Badge } from '@/shared/ui'
import { formatPrice, getImageUrl } from '@/shared/lib'
import { ROUTES, env } from '@/shared/config'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getImageUrl(product.images?.[0], env.S3_URL)

  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price

  return (
    <Link href={ROUTES.product(product.slug)}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg py-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Sale
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge variant="secondary">Out of stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium truncate">{product.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-bold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
