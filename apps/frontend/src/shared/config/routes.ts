export const ROUTES = {
  home: '/',
  catalog: '/catalog',
  categoryProducts: (slug: string) => `/catalog/${slug}`,
  product: (slug: string) => `/product/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  login: '/login',
  register: '/register',
  profile: '/profile',
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
} as const
