'use client'

import { useQuery } from '@tanstack/react-query'
import { userKeys } from '@/entities/user'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ROUTES } from '@/shared/config'
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@/shared/ui'

export default function ProfilePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  const { data, isLoading } = useQuery({ ...userKeys.me, enabled: isAuthenticated })

  useEffect(() => {
    if (!isAuthenticated) router.push(ROUTES.login)
  }, [isAuthenticated, router])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  const user = data?.data

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First name</p>
              <p className="font-medium">{user?.firstName ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last name</p>
              <p className="font-medium">{user?.lastName ?? '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{user?.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
