'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api'
import { useAuthStore } from '@/features/auth/model/auth-store'
import type { RegisterInput } from '@ecomm/contracts'
import { ROUTES } from '@/shared/config'

export function useRegister() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res: { data: { accessToken: string; user: any } } = await apiClient
        .post('auth/register', { json: data, credentials: 'include' })
        .json()
      return res
    },
    onSuccess: (res) => {
      setAuth({ accessToken: res.data.accessToken, user: res.data.user })
      router.push(ROUTES.home)
    },
  })
}
