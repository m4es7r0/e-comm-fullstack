'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartKeys, getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/entities/cart'
import { useAuthStore } from '@/features/auth/model/auth-store'

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const queryClient = useQueryClient()

  const cartQuery = useQuery({
    ...cartKeys.current,
    enabled: isAuthenticated,
  })

  const cart = cartQuery.data?.data ?? null

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: cartKeys.current.queryKey })

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: invalidateCart,
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, { quantity }),
    onSuccess: invalidateCart,
  })

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: invalidateCart,
  })

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: invalidateCart,
  })

  return {
    cart,
    isLoading: cartQuery.isLoading,
    totalItems: cart?.totalItems ?? 0,
    totalPrice: cart?.totalPrice ?? 0,
    addItem: addMutation.mutate,
    updateQuantity: (itemId: string, quantity: number) =>
      updateMutation.mutate({ itemId, quantity }),
    removeItem: removeMutation.mutate,
    clear: clearMutation.mutate,
    isMutating:
      addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending,
  }
}
