'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button, Separator } from '@/shared/ui'
import { formatPrice } from '@/shared/lib'
import { ROUTES } from '@/shared/config'
import { useCart } from '@/features/add-to-cart'
import { CartItemRow } from '@/entities/cart'
import type { CartItem } from '@ecomm/contracts'
import { useAuthStore } from '@/features/auth/model/auth-store'

export function CartSidebar() {
  const { cart, isLoading, isMutating, updateQuantity, removeItem, clear } = useCart()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Sign in to see your cart</p>
        <Link href={ROUTES.login} className="mt-4">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading cart...</div>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Add some products to get started</p>
        <Link href={ROUTES.catalog} className="mt-4">
          <Button>Browse catalog</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="divide-y">
        {cart.items.map((item: CartItem) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            disabled={isMutating}
          />
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
          <span className="font-medium">{formatPrice(cart.totalPrice)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(cart.totalPrice)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link href={ROUTES.checkout}>
          <Button className="w-full">Proceed to checkout</Button>
        </Link>
        <Button variant="outline" className="w-full" onClick={() => clear()} disabled={isMutating}>
          Clear cart
        </Button>
      </div>
    </div>
  )
}
