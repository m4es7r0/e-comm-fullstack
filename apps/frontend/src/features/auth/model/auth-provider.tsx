'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { env } from '@/shared/config'
import { useAuthStore } from './auth-store'

/**
 * Restores the user session on app load by exchanging the
 * httpOnly refresh_token cookie for a new access token.
 *
 * Must be placed inside Providers (needs QueryClient context)
 * but wrapping the rest of the app tree.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const tried = useRef(false)

  useEffect(() => {
    // Only attempt once per mount
    if (tried.current) return
    tried.current = true

    // If we already have a token (e.g. just logged in), skip
    if (useAuthStore.getState().accessToken) return

    // Try silent refresh using the httpOnly cookie
    fetch(`${env.API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json()
          setAuth(json.data)
        }
      })
      .catch(() => {
        // No valid session — stay logged out
        clearAuth()
      })
  }, [setAuth, clearAuth])

  return <>{children}</>
}
