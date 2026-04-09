import Link from 'next/link'
import type { CategoryTree } from '@ecomm/contracts'
import { Card, CardContent } from '@/shared/ui'
import { ROUTES } from '@/shared/config'
import { pluralize } from '@/shared/lib'

interface CategoryCardProps {
  category: CategoryTree
}

export function CategoryCard({ category }: CategoryCardProps) {
  const productCount = category._count?.products ?? 0

  return (
    <Link href={ROUTES.categoryProducts(category.slug)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold">{category.name}</h3>
          {category.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {pluralize(productCount, 'product', 'products')}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
