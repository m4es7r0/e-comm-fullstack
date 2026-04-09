import { CartSidebar } from '@/widgets/cart-sidebar'

export const metadata = {
  title: 'Cart',
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartSidebar />
    </div>
  )
}
