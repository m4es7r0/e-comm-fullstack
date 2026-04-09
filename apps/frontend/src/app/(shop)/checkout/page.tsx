'use client'

import { useAuthStore } from '@/features/auth/model/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ROUTES } from '@/shared/config'
import { ShippingForm } from '@/features/checkout-flow'
import { useCart } from '@/features/add-to-cart'
import { Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui'
import { formatPrice } from '@/shared/lib'
import type { CartItem } from '@ecomm/contracts'

export default function CheckoutPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  const { cart, isLoading } = useCart()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.login)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || isLoading) return null

  if (!cart || cart.items.length === 0) {
    router.push(ROUTES.cart)
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.title} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
