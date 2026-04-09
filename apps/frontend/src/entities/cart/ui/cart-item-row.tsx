'use client'

import Image from 'next/image'
import type { CartItem } from '@ecomm/contracts'
import { Button } from '@/shared/ui'
import { formatPrice, getImageUrl } from '@/shared/lib'
import { env } from '@/shared/config'
import { Minus, Plus, Trash2 } from 'lucide-react'

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  disabled?: boolean
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, disabled }: CartItemRowProps) {
  const imageUrl = getImageUrl(item.product.images?.[0], env.S3_URL)

  const lineTotal = item.product.price * item.quantity

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={imageUrl} alt={item.product.title} fill className="object-cover" sizes="80px" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="text-sm font-medium">{item.product.title}</h4>
          <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={disabled || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={disabled || item.quantity >= item.product.stock}
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{formatPrice(lineTotal)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              disabled={disabled}
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
