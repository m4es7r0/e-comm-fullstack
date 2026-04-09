import { apiClient } from '@/shared/api'
import type { Cart, AddToCartInput, UpdateCartItemInput, ApiResponse, ShippingAddress } from '@ecomm/contracts'

export async function getCart(): Promise<ApiResponse<Cart>> {
  return apiClient.get('cart').json()
}

export async function addToCart(data: AddToCartInput): Promise<ApiResponse<Cart>> {
  return apiClient.post('cart/items', { json: data }).json()
}

export async function updateCartItem(itemId: string, data: UpdateCartItemInput): Promise<ApiResponse<Cart>> {
  return apiClient.put(`cart/items/${itemId}`, { json: data }).json()
}

export async function removeCartItem(itemId: string): Promise<ApiResponse<Cart>> {
  return apiClient.delete(`cart/items/${itemId}`).json()
}

export async function clearCart(): Promise<ApiResponse<Cart>> {
  return apiClient.delete('cart').json()
}

export async function checkout(shippingAddress: ShippingAddress): Promise<ApiResponse<{ orderId: string }>> {
  return apiClient.post('cart/checkout', { json: { shippingAddress } }).json()
}
