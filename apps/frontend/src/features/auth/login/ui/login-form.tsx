'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginInputSchema, type LoginInput } from '@ecomm/contracts'
import { Button, Input, Label } from '@/shared/ui'
import { useLogin } from '../model/use-login'

export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {login.error && (
        <p className="text-sm text-destructive">
          {login.error instanceof Error ? login.error.message : 'Login failed'}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
