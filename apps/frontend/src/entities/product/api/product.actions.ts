import { apiClient, ENDPOINTS } from '@/shared/api'
import { toSearchParams } from '@/shared/lib'
import type { Product, ProductQuery, PaginatedResponse, ApiResponse } from '@ecomm/contracts'

export async function getProducts(params?: Partial<ProductQuery>): Promise<PaginatedResponse<Product>> {
  return apiClient.get(ENDPOINTS.products.list, { searchParams: toSearchParams(params) }).json()
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
  return apiClient.get(ENDPOINTS.products.detail(slug)).json()
}
