/**
 * All API endpoint paths — single source of truth.
 *
 * Paths are relative (no leading slash) so they work correctly
 * with ky's `prefixUrl` option.
 */
export const ENDPOINTS = {
  auth: {
    register: 'auth/register',
    login: 'auth/login',
    refresh: 'auth/refresh',
    logout: 'auth/logout',
  },
  users: {
    me: 'users/me',
    mePassword: 'users/me/password',
    list: 'users',
    detail: (id: string) => `users/${id}`,
  },
  products: {
    list: 'products',
    detail: (idOrSlug: string) => `products/${idOrSlug}`,
  },
  categories: {
    list: 'categories',
    detail: (idOrSlug: string) => `categories/${idOrSlug}`,
    products: (slug: string) => `categories/${slug}/products`,
  },
  cart: {
    get: 'cart',
    add: 'cart/items',
    updateItem: (itemId: string) => `cart/items/${itemId}`,
    removeItem: (itemId: string) => `cart/items/${itemId}`,
    clear: 'cart',
    checkout: 'cart/checkout',
  },
  orders: {
    list: 'orders',
    detail: (id: string) => `orders/${id}`,
    updateStatus: (id: string) => `orders/${id}/status`,
  },
  upload: {
    presign: 'upload/presign',
    delete: (key: string) => `upload/${encodeURIComponent(key)}`,
  },
  health: 'health',
} as const
