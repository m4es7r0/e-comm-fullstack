# Phase 3: Frontend — Next.js 16 Storefront (Week 5–7)

Цель: полноценный storefront с каталогом, корзиной, checkout, auth и профилем пользователя.

**Prerequisites**: Phase 2 завершена, backend API полностью рабочий.

---

## 3.1 Next.js Scaffold

### 3.1.1 Инициализация
- `apps/frontend/` — Next.js 16 с App Router
- Dependencies: `next`, `react`, `react-dom`, `tailwindcss`, `@tanstack/react-query`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`
- `@ecomm/qore` и `@ecomm/contracts` как workspace dependencies
- Tailwind CSS config + global styles

### 3.1.2 FSD структура
- Создать все директории по FSD:
  ```
  src/app/         → Next.js routing
  src/pages/       → FSD pages (композиция)
  src/widgets/     → составные блоки
  src/features/    → бизнес-действия
  src/entities/    → бизнес-сущности
  src/shared/      → UI kit, API client, утилиты, контракты
  ```
- Настроить path aliases: `@/shared`, `@/entities`, `@/features`, `@/widgets`, `@/pages`

### 3.1.3 App layer setup
- `src/app/layout.tsx` — root layout (html, body, fonts)
- `src/app/providers.tsx`:
  - `QueryClientProvider` (TanStack Query)
  - `ThemeProvider` (если нужно)
  - Auth context provider
- `src/app/global.css` — Tailwind directives

**Definition of Done**: `pnpm --filter frontend dev` стартует, пустая страница рендерится.

---

## 3.2 Shared Layer

### 3.2.1 API Client (qore integration)
- `src/shared/api/client.ts`:
  - `createApiClient({ prefixUrl: env.NEXT_PUBLIC_API_URL })`
  - Auth middleware: attach access token from memory
  - Auto-refresh middleware: on 401 → refresh → retry
- `src/shared/api/endpoints.ts`:
  - Re-export из `@ecomm/contracts`
- `src/shared/api/index.ts` — public API

### 3.2.2 UI Kit (shared/ui)
- `Button` — variants: primary, secondary, outline, ghost, danger; sizes: sm, md, lg
- `Input` — text, email, password, number; error state, label, helper text
- `Select` — dropdown с options
- `Modal` — overlay dialog с close
- `Badge` — status indicators (active, draft, archived, order statuses)
- `Skeleton` — loading placeholders (line, card, table row)
- `Spinner` — loading spinner
- `Card` — generic card container
- `Pagination` — page navigation component
- `Toast` — notification system (success, error, info)
- `EmptyState` — placeholder для пустых списков
- `ErrorBanner` — error display

### 3.2.3 Shared utilities (shared/lib)
- `formatPrice(amount, currency)` — форматирование цен
- `formatDate(date)` — форматирование дат
- `cn(...classes)` — Tailwind class merge (clsx + twMerge)
- `pluralize(count, singular, plural)` — pluralization

### 3.2.4 Shared contracts
- `src/shared/contracts/` — UIContract, ListContract, FormContract
  - Перенести из architecture guide
  - Re-export из `@ecomm/contracts/ui`

### 3.2.5 Shared config
- `src/shared/config/env.ts` — typed env variables
- `src/shared/config/routes.ts` — all frontend routes as constants

**Definition of Done**: UI kit компоненты рендерятся, qore client создаётся, утилиты работают.

---

## 3.3 Entity Layer

### 3.3.1 Product entity
- `entities/product/model/types.ts` — re-export Product type from contracts
- `entities/product/api/product.actions.ts`:
  - `getProducts(params)` — apiClient.get → parse response
  - `getProductBySlug(slug)` — apiClient.get → parse
- `entities/product/api/product.queries.ts`:
  - `productQueries = createQueryKeys('products', ...)` — list, detail
- `entities/product/api/product.cache.ts`:
  - Cache strategies для будущих мутаций
- `entities/product/lib/adapter.ts`:
  - `adaptProductToCard(product)` → UIContract<ProductCardValue>
  - `adaptProductToDetail(product)` → UIContract<ProductDetailValue>
- `entities/product/ui/product-card.tsx` — карточка товара
- `entities/product/ui/product-card-skeleton.tsx` — skeleton loader
- `entities/product/ui/product-badge.tsx` — status/discount badge
- `entities/product/index.ts` — public API

### 3.3.2 Category entity
- `entities/category/model/types.ts`
- `entities/category/api/category.actions.ts`
- `entities/category/api/category.queries.ts`
- `entities/category/lib/adapter.ts` — adaptCategoryToNav, adaptCategoryToBreadcrumb
- `entities/category/ui/category-card.tsx`
- `entities/category/ui/category-nav.tsx` — navigation item
- `entities/category/index.ts`

### 3.3.3 User entity
- `entities/user/model/types.ts`
- `entities/user/api/user.actions.ts`
- `entities/user/api/user.queries.ts`
- `entities/user/lib/adapter.ts`
- `entities/user/index.ts`

### 3.3.4 Order entity
- `entities/order/model/types.ts`
- `entities/order/api/order.actions.ts`
- `entities/order/api/order.queries.ts`
- `entities/order/lib/adapter.ts` — adaptOrderToRow, adaptOrderToDetail
- `entities/order/ui/order-row.tsx` — строка в таблице заказов
- `entities/order/ui/order-status-badge.tsx`
- `entities/order/index.ts`

### 3.3.5 Cart entity
- `entities/cart/model/types.ts` — CartItem type
- `entities/cart/lib/adapter.ts`
- `entities/cart/ui/cart-item.tsx`
- `entities/cart/index.ts`

**Definition of Done**: Все entities имеют actions, queries, adapters, базовые UI компоненты.

---

## 3.4 Features Layer

### 3.4.1 Auth feature
- `features/auth/login/model/use-login.ts`:
  - React Hook Form + Zod resolver (LoginInputSchema)
  - `useMutation` → auth.login → сохраняет tokens → redirect
- `features/auth/login/ui/login-form.tsx`
- `features/auth/register/model/use-register.ts`
- `features/auth/register/ui/register-form.tsx`
- `features/auth/model/auth-store.ts`:
  - Zustand store: `user`, `accessToken`, `isAuthenticated`
  - Actions: `setAuth`, `clearAuth`, `refreshToken`
- `features/auth/lib/token-storage.ts`:
  - Access token в memory (zustand)
  - Refresh token в httpOnly cookie (managed by backend)
- `features/auth/index.ts`

### 3.4.2 Add to Cart feature
- `features/add-to-cart/model/cart-store.ts`:
  - Zustand store: items, addItem, removeItem, updateQuantity, clear
  - Persist to localStorage (zustand/middleware)
  - totalItems(), totalPrice() computed
- `features/add-to-cart/ui/add-to-cart-button.tsx`
- `features/add-to-cart/ui/quantity-selector.tsx`
- `features/add-to-cart/index.ts`

### 3.4.3 Filter Products feature
- `features/filter-products/model/use-product-filters.ts`:
  - Состояние фильтров: category, priceRange, sort, search
  - Синхронизация с URL query params
- `features/filter-products/ui/filter-panel.tsx`
- `features/filter-products/ui/sort-select.tsx`
- `features/filter-products/ui/price-range-filter.tsx`
- `features/filter-products/index.ts`

### 3.4.4 Search Products feature
- `features/search-products/model/use-search.ts`:
  - Debounced search input
  - Query с search param
- `features/search-products/ui/search-bar.tsx`
- `features/search-products/index.ts`

### 3.4.5 Checkout Flow feature
- `features/checkout-flow/model/use-checkout.ts`:
  - Multi-step form: shipping address → review → confirm
  - `useMutation` → orders.create
  - Clear cart on success
- `features/checkout-flow/ui/shipping-form.tsx`
- `features/checkout-flow/ui/order-summary.tsx`
- `features/checkout-flow/ui/checkout-steps.tsx`
- `features/checkout-flow/lib/checkout-schema.ts` — Zod schema для shipping
- `features/checkout-flow/index.ts`

**Definition of Done**: Все features работают изолированно: auth flow, cart management, filtering, search, checkout.

---

## 3.5 Widgets Layer

### 3.5.1 Header widget
- `widgets/header/ui/header.tsx`:
  - Logo + навигация
  - Search bar (from features/search)
  - Cart icon с badge (items count)
  - User menu (login/register или profile/logout)
- `widgets/header/index.ts`

### 3.5.2 Footer widget
- `widgets/footer/ui/footer.tsx`
- `widgets/footer/index.ts`

### 3.5.3 Product Catalog widget
- `widgets/product-catalog/ui/product-catalog.tsx`:
  - Combines: FilterPanel + SortSelect + ProductGrid + Pagination
  - Uses productQueries.list
  - Adapter: products → ListContract
- `widgets/product-catalog/ui/product-grid.tsx` — responsive grid
- `widgets/product-catalog/index.ts`

### 3.5.4 Product Detail widget
- `widgets/product-detail/ui/product-detail.tsx`:
  - Image gallery (main + thumbnails)
  - Product info (title, price, description, attributes)
  - AddToCartButton + QuantitySelector
  - Stock status
  - Category breadcrumb
- `widgets/product-detail/index.ts`

### 3.5.5 Cart Sidebar widget
- `widgets/cart-sidebar/ui/cart-sidebar.tsx`:
  - Cart items list с quantity controls
  - Cart summary (subtotal, total)
  - "Proceed to checkout" button
  - Empty cart state
- `widgets/cart-sidebar/index.ts`

### 3.5.6 Checkout Form widget
- `widgets/checkout-form/ui/checkout-form.tsx`:
  - Steps indicator
  - ShippingForm → OrderSummary → Confirmation
  - Integrates checkout-flow feature
- `widgets/checkout-form/index.ts`

### 3.5.7 Order Table widget
- `widgets/order-table/ui/order-table.tsx`:
  - Table с order rows
  - Status badges
  - Pagination
- `widgets/order-table/index.ts`

**Definition of Done**: Виджеты собирают entities + features, data flow через adapters и UIContracts.

---

## 3.6 Pages Layer (FSD) + App Router

### 3.6.1 Home page
- `src/pages/home/ui/home-page.tsx` — hero + featured categories + popular products
- `src/app/(shop)/page.tsx` — renders HomePage

### 3.6.2 Catalog page
- `src/pages/catalog/ui/catalog-page.tsx` — ProductCatalog widget
- `src/app/(shop)/catalog/page.tsx` — SSR: prefetch products, parse query params
- `src/app/(shop)/catalog/[slug]/page.tsx` — category-filtered catalog

### 3.6.3 Product Detail page
- `src/pages/product-detail/ui/product-detail-page.tsx` — ProductDetail widget
- `src/app/(shop)/product/[slug]/page.tsx` — SSR: prefetch product by slug, SEO meta

### 3.6.4 Cart page
- `src/pages/cart/ui/cart-page.tsx` — CartSidebar widget (full-page version)
- `src/app/(shop)/cart/page.tsx`

### 3.6.5 Checkout page
- `src/pages/checkout/ui/checkout-page.tsx` — CheckoutForm widget
- `src/app/(shop)/checkout/page.tsx` — protected (redirect if not auth)

### 3.6.6 Auth pages
- `src/pages/auth/login/ui/login-page.tsx`
- `src/pages/auth/register/ui/register-page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`

### 3.6.7 Profile page
- `src/pages/profile/ui/profile-page.tsx` — user info + edit form
- `src/app/(account)/profile/page.tsx` — protected

### 3.6.8 Order History page
- `src/pages/order-history/ui/order-history-page.tsx` — OrderTable widget
- `src/app/(account)/orders/page.tsx` — protected

### 3.6.9 Order Detail page
- `src/pages/order-detail/ui/order-detail-page.tsx`
- `src/app/(account)/orders/[id]/page.tsx` — protected

**Definition of Done**: Все страницы доступны, навигация работает, SSR для каталога и товаров.

---

## 3.7 SSR & Performance

### 3.7.1 Server-side data fetching
- Catalog page: `generateStaticParams` или dynamic с cache
- Product detail: SSR with revalidation
- Category pages: SSR
- TanStack Query hydration: prefetch on server → dehydrate → hydrate on client

### 3.7.2 SEO
- Dynamic `metadata` для product pages (title, description, og:image)
- `sitemap.ts` generation
- Structured data (JSON-LD) для products

### 3.7.3 Image optimization
- `next/image` для product images
- MinIO image URLs через Next.js image loader config

**Definition of Done**: Product pages SSR с meta tags, Lighthouse SEO score > 90.

---

## 3.8 Verification Checklist

- [ ] Home page renders с featured products
- [ ] Catalog: grid view, pagination, filters (category, price, sort), search
- [ ] Product detail: images, info, add to cart
- [ ] Cart: add/remove/update quantity, persist in localStorage
- [ ] Auth: register → login → token в memory → protected routes work
- [ ] Checkout: shipping form → review → create order → redirect to order detail
- [ ] Profile: view + edit user info
- [ ] Order history: list of user orders
- [ ] Order detail: items, status, total
- [ ] SSR: catalog + product pages render on server
- [ ] Responsive: mobile-first, works on 375px+
- [ ] qore: all API calls через qore client + query keys + cache strategies
- [ ] FSD: правила импортов соблюдены (no upward imports)
- [ ] Adapters: domain → UIContract для всех entity UI components
