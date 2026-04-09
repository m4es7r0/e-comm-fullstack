import { createQueryKeys } from '@ecomm/qore'
import { getCart } from './cart.actions'

export const cartKeys = createQueryKeys('cart', (q) => ({
  current: q.scope('current').query(() => getCart()),
}))
