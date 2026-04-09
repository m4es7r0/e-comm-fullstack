'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterInputSchema, type RegisterInput } from '@ecomm/contracts'
import { Button, Input, Label } from '@/shared/ui'
import { useRegister } from '../model/use-register'

export function RegisterForm() {
  const register_ = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => register_.mutate(data))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

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

      {register_.error && (
        <p className="text-sm text-destructive">
          {register_.error instanceof Error ? register_.error.message : 'Registration failed'}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={register_.isPending}>
        {register_.isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
