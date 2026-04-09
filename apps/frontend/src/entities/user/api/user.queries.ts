import { createQueryKeys } from '@ecomm/qore'
import { getMe } from './user.actions'

export const userKeys = createQueryKeys('users', (q) => ({
  me: q.scope('me').query(() => getMe()),
}))
