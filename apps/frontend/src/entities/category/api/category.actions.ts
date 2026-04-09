import { apiClient, ENDPOINTS } from '@/shared/api'
import { toSearchParams } from '@/shared/lib'
import type { CategoryTree, ApiResponse, PaginatedResponse, Product, ProductQuery } from '@ecomm/contracts'

export async function getCategories(): Promise<ApiResponse<CategoryTree[]>> {
  return apiClient.get(ENDPOINTS.categories.list).json()
}

export async function getCategoryBySlug(slug: string): Promise<ApiResponse<CategoryTree>> {
  return apiClient.get(ENDPOINTS.categories.detail(slug)).json()
}

export async function getCategoryProducts(
  slug: string,
  params?: Partial<ProductQuery>,
): Promise<PaginatedResponse<Product>> {
  return apiClient.get(ENDPOINTS.categories.products(slug), { searchParams: toSearchParams(params) }).json()
}
