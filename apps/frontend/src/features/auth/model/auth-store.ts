import { create } from 'zustand'
import type { PublicUser, JWTPayload } from '@ecomm/contracts'

interface AuthState {
  user: PublicUser | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (data: { accessToken: string; user?: PublicUser }) => void
  setUser: (user: PublicUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: ({ accessToken, user }) =>
    set({
      accessToken,
      user: user ?? null,
      isAuthenticated: true,
    }),

  setUser: (user) => set({ user }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}))
