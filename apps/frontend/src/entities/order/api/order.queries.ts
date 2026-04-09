import { createQueryKeys } from '@ecomm/qore'
import { getOrders, getOrderById } from './order.actions'
import type { OrderQuery } from '@ecomm/contracts'

export const orderKeys = createQueryKeys('orders', (q) => ({
  list: q.scope('list').query(
    (params?: Partial<OrderQuery>) => [params] as const,
    (params) => getOrders(params),
  ),
  detail: q.scope('detail').query(
    (id: string) => [id] as const,
    (id) => getOrderById(id),
  ),
}))
