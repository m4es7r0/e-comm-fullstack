'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { checkout, cartKeys } from '@/entities/cart'
import type { ShippingAddress } from '@ecomm/contracts'
import { ROUTES } from '@/shared/config'

export function useCheckout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (shippingAddress: ShippingAddress) => checkout(shippingAddress),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current.queryKey })
      router.push(ROUTES.orderDetail(res.data.orderId))
    },
  })
}
