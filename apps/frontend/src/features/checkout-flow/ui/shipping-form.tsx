'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShippingAddressSchema, type ShippingAddress } from '@ecomm/contracts'
import { Button, Input, Label } from '@/shared/ui'
import { useCheckout } from '../model/use-checkout'

export function ShippingForm() {
  const checkout = useCheckout()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => checkout.mutate(data))} className="space-y-4">
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
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State / Region</Label>
          <Input id="state" {...register('state')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" {...register('postalCode')} />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} />
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" type="tel" {...register('phone')} />
      </div>

      {checkout.error && (
        <p className="text-sm text-destructive">
          {checkout.error instanceof Error ? checkout.error.message : 'Checkout failed'}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={checkout.isPending}>
        {checkout.isPending ? 'Placing order...' : 'Place order'}
      </Button>
    </form>
  )
}
