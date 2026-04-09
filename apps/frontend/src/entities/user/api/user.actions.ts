import { apiClient, ENDPOINTS } from '@/shared/api'
import type { PublicUser, UpdateProfileInput, ChangePasswordInput, ApiResponse } from '@ecomm/contracts'

export async function getMe(): Promise<ApiResponse<PublicUser>> {
  return apiClient.get(ENDPOINTS.users.me).json()
}

export async function updateProfile(data: UpdateProfileInput): Promise<ApiResponse<PublicUser>> {
  return apiClient.put(ENDPOINTS.users.me, { json: data }).json()
}

export async function changePassword(data: ChangePasswordInput): Promise<ApiResponse<{ message: string }>> {
  return apiClient.put(ENDPOINTS.users.mePassword, { json: data }).json()
}
