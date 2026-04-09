'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { orderKeys, OrderStatusBadge } from '@/entities/order'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { Card, CardContent, CardHeader, CardTitle, Separator, Spinner } from '@/shared/ui'
import { formatPrice, formatDate } from '@/shared/lib'
import type { OrderItem } from '@ecomm/contracts'

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data, isLoading } = useQuery({
    ...orderKeys.detail(id),
    enabled: isAuthenticated && !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  const order = data?.data
  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Order not found</h1>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: OrderItem) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">Product #{item.productId.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
