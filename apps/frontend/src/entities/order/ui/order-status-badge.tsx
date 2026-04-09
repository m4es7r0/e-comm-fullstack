import type { OrderStatus } from '@ecomm/contracts'
import type { VariantProps } from 'class-variance-authority'
import { Badge, badgeVariants } from '@/shared/ui'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const statusConfig: Record<OrderStatus, { label: string; variant: BadgeVariant; className?: string }> = {
  PENDING: { label: 'Pending', variant: 'outline', className: 'border-amber-500/50 text-amber-600 dark:text-amber-400' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PROCESSING: { label: 'Processing', variant: 'default' },
  SHIPPED: { label: 'Shipped', variant: 'secondary' },
  DELIVERED: { label: 'Delivered', variant: 'outline', className: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
}
