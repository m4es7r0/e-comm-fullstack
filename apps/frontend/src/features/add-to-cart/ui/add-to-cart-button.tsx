'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useCart } from '../model/use-cart'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config'

interface AddToCartButtonProps {
  productId: string
  stock: number
  quantity?: number
}

export function AddToCartButton({ productId, stock, quantity = 1 }: AddToCartButtonProps) {
  const { addItem, isMutating } = useCart()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(ROUTES.login)
      return
    }
    addItem({ productId, quantity })
  }

  return (
    <Button onClick={handleClick} disabled={stock === 0 || isMutating} className="gap-2">
      <ShoppingCart className="h-4 w-4" />
      {stock === 0 ? 'Out of stock' : isMutating ? 'Adding...' : 'Add to cart'}
    </Button>
  )
}
