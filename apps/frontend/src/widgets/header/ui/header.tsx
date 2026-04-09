'use client'

import Link from 'next/link'
import { ShoppingCart, User, LogOut, Package } from 'lucide-react'
import { Button } from '@/shared/ui'
import { ROUTES } from '@/shared/config'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { useCart } from '@/features/add-to-cart'
import { apiClient } from '@/shared/api'

export function Header() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const { totalItems } = useCart()

  const handleLogout = async () => {
    try {
      await apiClient.post('auth/logout', { credentials: 'include' })
    } catch {
      // ignore
    }
    clearAuth()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href={ROUTES.home} className="text-xl font-bold">
          E-Shop
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href={ROUTES.catalog} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Catalog
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link href={ROUTES.cart}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href={ROUTES.orders}>
                <Button variant="ghost" size="icon">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.profile}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.firstName ?? 'Profile'}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href={ROUTES.login}>
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
