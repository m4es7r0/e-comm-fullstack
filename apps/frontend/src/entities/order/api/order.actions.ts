import { apiClient, ENDPOINTS } from '@/shared/api'
import { toSearchParams } from '@/shared/lib'
import type { Order, OrderQuery, PaginatedResponse, ApiResponse } from '@ecomm/contracts'

export async function getOrders(params?: Partial<OrderQuery>): Promise<PaginatedResponse<Order>> {
  return apiClient.get(ENDPOINTS.orders.list, { searchParams: toSearchParams(params) }).json()
}

export async function getOrderById(id: string): Promise<ApiResponse<Order>> {
  return apiClient.get(ENDPOINTS.orders.detail(id)).json()
}
