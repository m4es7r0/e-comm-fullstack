import { Card, CardContent, Skeleton } from '@/shared/ui'

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-5 w-1/3" />
      </CardContent>
    </Card>
  )
}
