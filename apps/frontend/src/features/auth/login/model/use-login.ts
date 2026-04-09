'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { getMe } from '@/entities/user'
import type { LoginInput } from '@ecomm/contracts'
import { ROUTES } from '@/shared/config'

export function useLogin() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res: { data: { accessToken: string } } = await apiClient
        .post('auth/login', { json: data, credentials: 'include' })
        .json()
      return res
    },
    onSuccess: async (res) => {
      setAuth({ accessToken: res.data.accessToken })

      // Fetch user profile
      try {
        const meRes = await getMe()
        setUser(meRes.data)
      } catch {
        // non-critical
      }

      router.push(ROUTES.home)
    },
  })
}
