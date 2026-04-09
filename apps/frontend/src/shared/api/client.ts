import { createApiClient, type ApiMiddleware } from '@ecomm/qore'
import { env } from '@/shared/config'

/** Middleware: attach access token + auto-refresh on 401 */
const authMiddleware: ApiMiddleware = {
  beforeRequest: (request) => {
    // Dynamic import avoided — use global getter
    const token = getAccessToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
  },
  afterResponse: async (_request, _options, response) => {
    if (response.status === 401 && getAccessToken()) {
      try {
        const refreshRes = await fetch(`${env.API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (refreshRes.ok) {
          const data = await refreshRes.json()
          const { useAuthStore } = await import('@/features/auth/model/auth-store')
          useAuthStore.getState().setAuth(data.data)
        } else {
          const { useAuthStore } = await import('@/features/auth/model/auth-store')
          useAuthStore.getState().clearAuth()
        }
      } catch {
        const { useAuthStore } = await import('@/features/auth/model/auth-store')
        useAuthStore.getState().clearAuth()
      }
    }
  },
}

function getAccessToken(): string | null {
  try {
    // Avoid importing at module level to prevent circular deps
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/features/auth/model/auth-store')
    return useAuthStore.getState().accessToken
  } catch {
    return null
  }
}

export const apiClient = createApiClient({
  prefixUrl: env.API_URL,
  middleware: [authMiddleware],
  options: {
    credentials: 'include',
  },
})
