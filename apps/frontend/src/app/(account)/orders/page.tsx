'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { orderKeys, OrderStatusBadge } from '@/entities/order'
import type { Order } from '@ecomm/contracts'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ROUTES } from '@/shared/config'
import { Card, CardContent, Spinner } from '@/shared/ui'
import { formatPrice, formatDate } from '@/shared/lib'

export default function OrdersPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  const { data, isLoading } = useQuery({ ...orderKeys.list(undefined), enabled: isAuthenticated })

  useEffect(() => {
    if (!isAuthenticated) router.push(ROUTES.login)
  }, [isAuthenticated, router])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const orders: Order[] = data?.data ?? []

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={ROUTES.orderDetail(order.id)}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
