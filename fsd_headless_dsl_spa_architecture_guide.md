# Engineering Document: FSD + Headless DSL Architecture for SPA / Next.js Applications

Адаптированная методичка по построению **масштабируемой архитектуры** для типовых SPA и Next.js приложений — e-commerce, admin dashboard, CMS — на основе **Feature-Sliced Design (FSD)** и принципов **Headless DSL-Driven Architecture**.

---

# 1. Зачем объединять FSD и Headless DSL

FSD дает **структуру проекта**: слои, слайсы, сегменты, правила импортов.

Headless DSL дает **структуру данных и контрактов**: schema-first, registry, adapter, UI contract.

Вместе это решает две главные проблемы:

1. **Где что лежит** — отвечает FSD
2. **Как данные текут от API до UI** — отвечает Headless DSL

Для e-commerce, CMS и admin dashboard это идеальная комбинация, потому что в таких приложениях много сущностей (product, order, user, category) и много переиспользуемого UI (таблицы, формы, фильтры, карточки).

---

# 2. Главная идея

> **FSD определяет где живет код. Headless DSL определяет как код общается между слоями.**

Принцип остается тот же:

1. определить **модель данных и контракт**
2. определить **валидируемую схему**
3. определить **бизнес-логику в features**
4. определить **UI-адаптер**
5. определить **UI-реализацию**, которая только читает контракт

Но всё это теперь размещается внутри FSD-структуры.

---

# 3. Краткое напоминание: слои FSD

```txt
app/          → инициализация, providers, routing, layouts
  ↓
pages/        → композиция фичей в конкретные страницы
  ↓
widgets/      → составные блоки UI из нескольких фичей/сущностей
  ↓
features/     → бизнес-действия пользователя (add-to-cart, login, filter-products)
  ↓
entities/     → бизнес-сущности (product, order, user, category)
  ↓
shared/       → переиспользуемые утилиты, UI-kit, типы, конфиги, контракты
```

Правило импортов FSD:

> Слой может импортировать только из слоев ниже себя. Никогда вверх.

---

# 4. Куда ложатся концепции Headless DSL внутри FSD

| Headless DSL концепция | FSD слой | Что там живет |
|---|---|---|
| **Contract / Schema** | `shared/contracts` | Zod-схемы, базовые типы, UIContract |
| **Domain Model** | `entities/*/model` | Типы сущностей, stores, selectors |
| **Schema Validation** | `entities/*/lib` | Парсинг, миграции, safeParse обертки |
| **Registry** | `shared/registry` | Реестр типов (для динамических сущностей) |
| **Adapter** | `entities/*/lib` или `features/*/lib` | Преобразование domain → UIContract |
| **Renderer** | `widgets/*` | Композиция и интерпретация |
| **UI Implementation** | `shared/ui` + `entities/*/ui` | Конкретные компоненты |
| **Actions** | `features/*/model` | Бизнес-действия |

---

# 5. Структура проекта: практический шаблон

```txt
src/
├── app/
│   ├── providers/          # ThemeProvider, QueryProvider, StoreProvider
│   ├── layouts/            # RootLayout, DashboardLayout, AuthLayout
│   ├── styles/             # global styles, tailwind config
│   └── index.tsx           # entry point / app initialization
│
├── pages/
│   ├── home/
│   ├── product-detail/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── orders/
│   └── auth/
│       ├── login/
│       └── register/
│
├── widgets/
│   ├── product-catalog/    # ProductGrid + Filters + Sorting + Pagination
│   ├── cart-sidebar/       # CartItems + CartSummary + PromoCode
│   ├── order-table/        # Table + Filters + BulkActions
│   ├── header/
│   └── footer/
│
├── features/
│   ├── add-to-cart/
│   │   ├── model/          # logic, store slice
│   │   ├── ui/             # AddToCartButton
│   │   └── lib/            # helpers
│   ├── filter-products/
│   ├── search-products/
│   ├── checkout-flow/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── manage-products/    # CRUD for admin
│   └── manage-orders/
│
├── entities/
│   ├── product/
│   │   ├── model/          # types, store, selectors
│   │   ├── ui/             # ProductCard, ProductRow, ProductBadge
│   │   ├── api/            # getProducts, getProductById
│   │   └── lib/            # schema, adapter, helpers
│   ├── order/
│   ├── user/
│   ├── category/
│   ├── cart/
│   └── review/
│
└── shared/
    ├── ui/                 # Button, Input, Modal, Table, Badge, Skeleton
    ├── contracts/          # UIContract, UIState, UIActions, BaseEntity
    ├── lib/                # formatPrice, formatDate, cn(), debounce
    ├── api/                # apiClient, interceptors, error handling
    ├── config/             # env, routes, constants
    ├── types/              # global utility types
    └── registry/           # entity registry (если нужна динамика)
```

---

# 6. Shared Contracts: фундамент системы

Это адаптация Headless DSL контракта под SPA-реалии.

## 6.1. Базовый UIContract

```ts
// shared/contracts/ui-contract.ts

export type UIState = {
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  error?: string | null
}

export type UIActions<TValue> = {
  onChange?: (next: TValue) => void
  onSubmit?: () => void
  onReset?: () => void
  onRemove?: () => void
}

export type UIContract<TValue = unknown, TMeta = unknown> = {
  value: TValue
  state: UIState
  actions: UIActions<TValue>
  meta?: TMeta
}
```

## 6.2. Базовая сущность

```ts
// shared/contracts/base-entity.ts

export type BaseEntity = {
  id: string
  createdAt: string
  updatedAt: string
}
```

## 6.3. Контракт списка

Почти в каждом SPA есть списки с пагинацией и фильтрами:

```ts
// shared/contracts/list-contract.ts

export type ListMeta = {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type ListState = UIState & {
  empty?: boolean
  refreshing?: boolean
}

export type ListContract<TItem> = {
  items: TItem[]
  state: ListState
  actions: {
    onLoadMore?: () => void
    onRefresh?: () => void
    onSort?: (field: string, direction: "asc" | "desc") => void
    onFilter?: (filters: Record<string, unknown>) => void
  }
  meta: ListMeta
}
```

## 6.4. Контракт формы

```ts
// shared/contracts/form-contract.ts

export type FieldError = {
  field: string
  message: string
}

export type FormState = UIState & {
  dirty?: boolean
  submitting?: boolean
  submitted?: boolean
}

export type FormContract<TValues> = {
  values: TValues
  state: FormState
  errors: FieldError[]
  actions: {
    onChange: (field: keyof TValues, value: unknown) => void
    onSubmit: () => void
    onReset: () => void
  }
}
```

---

# 7. Entity: анатомия сущности на примере Product

## 7.1. Модель и типы

```ts
// entities/product/model/types.ts

import { BaseEntity } from "@/shared/contracts"

export type Product = BaseEntity & {
  title: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  currency: string
  images: string[]
  categoryId: string
  status: "draft" | "active" | "archived"
  stock: number
  attributes: Record<string, string>
}
```

## 7.2. Schema (Zod)

```ts
// entities/product/lib/schema.ts

import { z } from "zod"

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  currency: z.string().default("USD"),
  images: z.array(z.string().url()),
  categoryId: z.string(),
  status: z.enum(["draft", "active", "archived"]),
  stock: z.number().int().min(0),
  attributes: z.record(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type ProductInput = z.infer<typeof ProductSchema>

// Для формы создания — без id и дат
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
```

## 7.3. API слой

```ts
// entities/product/api/product-api.ts

import { apiClient } from "@/shared/api"
import { ProductSchema } from "../lib/schema"
import type { Product } from "../model/types"

export const productApi = {
  getAll: async (params?: {
    page?: number
    pageSize?: number
    categoryId?: string
    status?: string
  }): Promise<{ items: Product[]; total: number }> => {
    const response = await apiClient.get("/products", { params })
    // Валидация на границе системы
    const items = response.data.items.map((item: unknown) =>
      ProductSchema.parse(item)
    )
    return { items, total: response.data.total }
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return ProductSchema.parse(response.data)
  },

  create: async (data: unknown): Promise<Product> => {
    const response = await apiClient.post("/products", data)
    return ProductSchema.parse(response.data)
  },

  update: async (id: string, data: unknown): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data)
    return ProductSchema.parse(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}
```

## 7.4. Adapter: domain → UI contract

```ts
// entities/product/lib/adapter.ts

import type { Product } from "../model/types"
import type { UIContract } from "@/shared/contracts"
import { formatPrice } from "@/shared/lib"

export type ProductCardValue = {
  id: string
  title: string
  image: string
  price: string
  compareAtPrice?: string
  hasDiscount: boolean
  inStock: boolean
  status: Product["status"]
}

export type ProductCardMeta = {
  slug: string
  categoryId: string
}

export function adaptProductToCard(
  product: Product,
  ctx?: { loading?: boolean }
): UIContract<ProductCardValue, ProductCardMeta> {
  return {
    value: {
      id: product.id,
      title: product.title,
      image: product.images[0] ?? "",
      price: formatPrice(product.price, product.currency),
      compareAtPrice: product.compareAtPrice
        ? formatPrice(product.compareAtPrice, product.currency)
        : undefined,
      hasDiscount:
        !!product.compareAtPrice && product.compareAtPrice > product.price,
      inStock: product.stock > 0,
      status: product.status,
    },
    state: {
      loading: ctx?.loading ?? false,
    },
    actions: {},
    meta: {
      slug: product.slug,
      categoryId: product.categoryId,
    },
  }
}
```

## 7.5. UI компоненты entity

```tsx
// entities/product/ui/product-card.tsx

import type { UIContract } from "@/shared/contracts"
import type { ProductCardValue, ProductCardMeta } from "../lib/adapter"

type Props = UIContract<ProductCardValue, ProductCardMeta>

export function ProductCard({ value, state, meta }: Props) {
  if (state.loading) return <ProductCardSkeleton />

  return (
    <article>
      <img src={value.image} alt={value.title} />
      <h3>{value.title}</h3>
      <div>
        <span>{value.price}</span>
        {value.hasDiscount && (
          <span className="line-through">{value.compareAtPrice}</span>
        )}
      </div>
      {!value.inStock && <span>Out of stock</span>}
    </article>
  )
}
```

Обрати внимание: **ProductCard ничего не знает** о domain-модели Product, о store, об API. Он получает готовый UIContract и рисует.

## 7.6. Public API сущности

```ts
// entities/product/index.ts

// model
export type { Product } from "./model/types"

// api
export { productApi } from "./api/product-api"

// lib
export { ProductSchema, CreateProductSchema } from "./lib/schema"
export { adaptProductToCard } from "./lib/adapter"
export type { ProductCardValue, ProductCardMeta } from "./lib/adapter"

// ui
export { ProductCard } from "./ui/product-card"
```

Это public API по FSD. Никто не лезет внутрь слайса напрямую.

---

# 8. Feature: бизнес-действие на примере add-to-cart

Feature — это **действие пользователя**, а не сущность.

## 8.1. Модель / store

```ts
// features/add-to-cart/model/store.ts

import { create } from "zustand"
import type { Product } from "@/entities/product"

type CartItem = {
  productId: string
  quantity: number
  price: number
  title: string
}

type CartStore = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            quantity,
            price: product.price,
            title: product.title,
          },
        ],
      }
    })
  },

  removeItem: (productId) => {
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }))
  },

  updateQuantity: (productId, quantity) => {
    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }))
  },

  clear: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
```

## 8.2. UI фичи

```tsx
// features/add-to-cart/ui/add-to-cart-button.tsx

import { Button } from "@/shared/ui"
import { useCartStore } from "../model/store"
import type { Product } from "@/entities/product"

type Props = {
  product: Product
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const inCart = useCartStore((s) =>
    s.items.some((i) => i.productId === product.id)
  )

  return (
    <Button
      onClick={() => addItem(product)}
      disabled={disabled || product.stock === 0}
      variant={inCart ? "secondary" : "primary"}
    >
      {inCart ? "In cart" : "Add to cart"}
    </Button>
  )
}
```

## 8.3. Public API фичи

```ts
// features/add-to-cart/index.ts

export { AddToCartButton } from "./ui/add-to-cart-button"
export { useCartStore } from "./model/store"
```

---

# 9. Widget: композиция сущностей и фичей

Widget — это **составной блок**, который собирает entities и features в один осмысленный UI-блок.

```tsx
// widgets/product-catalog/ui/product-catalog.tsx

import { useQuery } from "@tanstack/react-query"
import { productApi, adaptProductToCard, ProductCard } from "@/entities/product"
import { AddToCartButton } from "@/features/add-to-cart"
import { FilterPanel } from "@/features/filter-products"
import type { ListContract } from "@/shared/contracts"

type Props = {
  categoryId?: string
}

export function ProductCatalog({ categoryId }: Props) {
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", categoryId, filters, page],
    queryFn: () =>
      productApi.getAll({ categoryId, page, pageSize: 20, ...filters }),
  })

  // Adapter: domain → list contract
  const listContract: ListContract<ReturnType<typeof adaptProductToCard>> = {
    items: (data?.items ?? []).map((p) => adaptProductToCard(p, { loading: isLoading })),
    state: {
      loading: isLoading,
      error: error?.message ?? null,
      empty: data?.items.length === 0,
    },
    actions: {
      onLoadMore: () => setPage((p) => p + 1),
      onFilter: (f) => {
        setFilters(f)
        setPage(1)
      },
    },
    meta: {
      total: data?.total ?? 0,
      page,
      pageSize: 20,
      hasMore: (data?.total ?? 0) > page * 20,
    },
  }

  return (
    <section>
      <FilterPanel onFilter={listContract.actions.onFilter!} />

      {listContract.state.empty && <EmptyState />}
      {listContract.state.error && <ErrorBanner message={listContract.state.error} />}

      <div className="grid grid-cols-4 gap-4">
        {listContract.items.map((contract) => (
          <div key={contract.value.id}>
            <ProductCard {...contract} />
            <AddToCartButton
              product={data!.items.find((p) => p.id === contract.value.id)!}
              disabled={!contract.value.inStock}
            />
          </div>
        ))}
      </div>

      {listContract.meta.hasMore && (
        <button onClick={listContract.actions.onLoadMore}>Load more</button>
      )}
    </section>
  )
}
```

Обрати внимание на поток данных:

```txt
API response → schema validation → domain model → adapter → UIContract → UI component
```

Widget — это место, где этот поток собирается.

---

# 10. Page: минимальная логика, максимальная композиция

```tsx
// pages/catalog/ui/catalog-page.tsx

import { ProductCatalog } from "@/widgets/product-catalog"
import { Header } from "@/widgets/header"

export function CatalogPage() {
  const { categoryId } = useParams()

  return (
    <>
      <Header />
      <main>
        <h1>Catalog</h1>
        <ProductCatalog categoryId={categoryId} />
      </main>
    </>
  )
}
```

Page не содержит бизнес-логики. Только композиция виджетов и роутинг-параметры.

---

# 11. Schema Validation: граница системы

Правило из Headless DSL остается:

> Никакие внешние данные не попадают в runtime без parse/safeParse

В SPA это применяется в трех местах:

## 11.1. API-ответы

```ts
// entities/product/api/product-api.ts
const product = ProductSchema.parse(response.data)
```

## 11.2. Формы (пользовательский ввод)

```ts
// features/manage-products/lib/validate.ts

import { CreateProductSchema } from "@/entities/product"

export function validateProductForm(data: unknown) {
  const result = CreateProductSchema.safeParse(data)
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    }
  }
  return { valid: true, data: result.data, errors: [] }
}
```

## 11.3. URL / query params

```ts
// shared/lib/parse-query.ts

import { z } from "zod"

export const CatalogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["price", "title", "createdAt"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
  category: z.string().optional(),
  search: z.string().optional(),
})

export type CatalogQuery = z.infer<typeof CatalogQuerySchema>

export function parseCatalogQuery(params: Record<string, string>): CatalogQuery {
  return CatalogQuerySchema.parse(params)
}
```

---

# 12. Когда нужен Registry в SPA

В большинстве SPA registry не нужен в полном виде. Он нужен когда:

- есть **динамические типы** сущностей (CMS с кастомными полями)
- есть **плагинная система** (подключаемые виджеты дашборда)
- есть **admin panel с конфигурируемыми колонками/формами**

## 12.1. Пример: registry для admin-таблиц

```ts
// shared/registry/entity-registry.ts

import { z } from "zod"
import type { UIContract } from "@/shared/contracts"

type EntityRegistryEntry<TEntity = unknown> = {
  type: string
  schema: z.ZodType<TEntity>
  columns: {
    key: string
    label: string
    render?: (entity: TEntity) => string
    sortable?: boolean
  }[]
  createDefault: () => Partial<TEntity>
  adaptToRow: (entity: TEntity) => UIContract
}

const registry = new Map<string, EntityRegistryEntry>()

export function registerEntity<T>(entry: EntityRegistryEntry<T>) {
  registry.set(entry.type, entry as EntityRegistryEntry)
}

export function getEntityEntry(type: string) {
  return registry.get(type) ?? null
}
```

## 12.2. Регистрация сущности

```ts
// entities/product/lib/register.ts

import { registerEntity } from "@/shared/registry"
import { ProductSchema } from "./schema"
import { formatPrice } from "@/shared/lib"

registerEntity({
  type: "product",
  schema: ProductSchema,
  columns: [
    { key: "title", label: "Title", sortable: true },
    {
      key: "price",
      label: "Price",
      render: (p) => formatPrice(p.price, p.currency),
      sortable: true,
    },
    { key: "status", label: "Status", sortable: true },
    { key: "stock", label: "Stock", sortable: true },
  ],
  createDefault: () => ({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    images: [],
    status: "draft" as const,
    stock: 0,
    attributes: {},
  }),
  adaptToRow: (product) => ({
    value: product,
    state: {},
    actions: {},
    meta: { entityType: "product" },
  }),
})
```

## 12.3. Универсальный admin-виджет

```tsx
// widgets/admin-table/ui/admin-table.tsx

import { getEntityEntry } from "@/shared/registry"

type Props = {
  entityType: string
  data: unknown[]
}

export function AdminTable({ entityType, data }: Props) {
  const entry = getEntityEntry(entityType)
  if (!entry) return <div>Unknown entity type: {entityType}</div>

  return (
    <table>
      <thead>
        <tr>
          {entry.columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => {
          const parsed = entry.schema.safeParse(item)
          if (!parsed.success) return null

          return (
            <tr key={i}>
              {entry.columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(parsed.data)
                    : String((parsed.data as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

Теперь для добавления нового типа сущности в admin panel достаточно:
1. создать entity slice
2. вызвать `registerEntity`

Без изменения кода таблицы.

---

# 13. Next.js специфика

## 13.1. Где живут Server Components

```txt
app/                      # Next.js App Router
├── (shop)/               # route group
│   ├── page.tsx          # → imports from pages/home
│   ├── catalog/
│   │   └── page.tsx      # → imports from pages/catalog
│   └── product/[slug]/
│       └── page.tsx      # → imports from pages/product-detail
├── (admin)/
│   ├── dashboard/
│   │   └── page.tsx
│   └── products/
│       └── page.tsx
├── layout.tsx
└── providers.tsx
```

`app/` в Next.js — это фактически маршрутизатор. Реальная логика и UI живет в FSD-слоях.

## 13.2. Server-side schema validation

```tsx
// app/(shop)/catalog/page.tsx

import { CatalogPage } from "@/pages/catalog"
import { parseCatalogQuery } from "@/shared/lib/parse-query"

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const query = parseCatalogQuery(searchParams)
  return <CatalogPage initialQuery={query} />
}
```

Schema validation на сервере — до того как данные попадут в client component.

## 13.3. Server Actions + Schema

```ts
// features/manage-products/api/actions.ts
"use server"

import { CreateProductSchema } from "@/entities/product"
import { productApi } from "@/entities/product"

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const result = CreateProductSchema.safeParse({
    ...raw,
    price: Number(raw.price),
    stock: Number(raw.stock),
    images: JSON.parse(raw.images as string),
    attributes: JSON.parse(raw.attributes as string),
  })

  if (!result.success) {
    return { error: result.error.flatten() }
  }

  const product = await productApi.create(result.data)
  return { data: product }
}
```

---

# 14. Разделение Persisted Data и Runtime State

Правило из Headless DSL, критичное для SPA:

## Persisted (приходит с сервера, хранится в query cache)

```ts
// Через TanStack Query / SWR
const { data: products } = useQuery({
  queryKey: ["products"],
  queryFn: productApi.getAll,
})
```

## Runtime (живет только в клиенте)

```ts
// Через zustand / useState / context
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
const [sortField, setSortField] = useState<string>("createdAt")
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
```

Не надо смешивать это в одном store. Серверные данные — в query cache. Клиентское UI-состояние — в UI-стейте.

---

# 15. Правила импортов (FSD cross-import rules)

```txt
shared     ← может импортировать: ничего (кроме внешних пакетов)
entities   ← может импортировать: shared
features   ← может импортировать: shared, entities
widgets    ← может импортировать: shared, entities, features
pages      ← может импортировать: shared, entities, features, widgets
app        ← может импортировать: всё
```

Дополнительные правила:

1. **Entity не импортирует другую entity** напрямую. Если нужна связь (Product → Category), она разрешается на уровне widget или feature.
2. **Feature не импортирует другую feature**. Координация между фичами — на уровне widget или page.
3. **Public API обязателен**. Каждый слайс экспортирует только через `index.ts`.

---

# 16. Adapter в контексте FSD

Adapter — один из ключевых паттернов, предотвращающих протекание domain-модели в UI.

## Без адаптера (плохо)

```tsx
<ProductCard
  title={product.title}
  price={`$${(product.price / 100).toFixed(2)}`}
  hasDiscount={!!product.compareAtPrice && product.compareAtPrice > product.price}
  inStock={product.stock > 0}
  image={product.images[0]}
/>
```

UI знает структуру domain. Формат цены вычисляется в компоненте. Логика `hasDiscount` размазана.

## С адаптером (правильно)

```tsx
const cardContract = adaptProductToCard(product)
<ProductCard {...cardContract} />
```

Вся подготовка — в одном месте. UI получает готовый контракт.

---

# 17. Антипаттерны в FSD + DSL контексте

## 17.1. Feature напрямую рендерит entity

Плохо: `features/add-to-cart/ui` содержит `<ProductCard>` внутри.
Правильно: виджет собирает `<ProductCard>` и `<AddToCartButton>` вместе.

## 17.2. Entity знает о фиче

Плохо: `entities/product/ui/product-card.tsx` импортирует `useCartStore`.
Правильно: ProductCard получает `actions.onAddToCart` через UIContract.

## 17.3. Page содержит бизнес-логику

Плохо: в `pages/catalog` живет `useQuery`, фильтрация, пагинация.
Правильно: это живет в widget `product-catalog`.

## 17.4. Shared UI зависит от entities

Плохо: `shared/ui/Table` знает про тип `Product`.
Правильно: `shared/ui/Table` — generic, принимает `columns` и `data`.

## 17.5. Нет schema validation на границе

Плохо: `response.data as Product` (type assertion).
Правильно: `ProductSchema.parse(response.data)` (runtime validation).

## 17.6. Один гигантский store

Плохо: один zustand store на всё приложение.
Правильно: store per feature + серверный кэш отдельно (TanStack Query).

---

# 18. Практический чеклист для нового проекта

Начальная настройка:

1. Инициализировать проект (Next.js / Vite + React)
2. Настроить path aliases (`@/shared`, `@/entities`, `@/features`, `@/widgets`, `@/pages`, `@/app`)
3. Создать `shared/contracts` — UIContract, ListContract, FormContract
4. Создать `shared/ui` — базовый UI kit (Button, Input, Modal, Table)
5. Создать `shared/api` — apiClient с interceptors
6. Установить zod

Для каждой новой сущности:

1. `entities/{name}/model/types.ts` — типы
2. `entities/{name}/lib/schema.ts` — Zod-схема
3. `entities/{name}/api/` — API-функции с schema validation
4. `entities/{name}/lib/adapter.ts` — domain → UIContract
5. `entities/{name}/ui/` — презентационные компоненты
6. `entities/{name}/index.ts` — public API

Для каждой новой фичи:

1. `features/{name}/model/` — store / logic
2. `features/{name}/ui/` — UI действия
3. `features/{name}/lib/` — хелперы, валидация
4. `features/{name}/index.ts` — public API

---

# 19. Рекомендуемый tech stack

| Задача | Инструмент |
|---|---|
| Framework | Next.js (App Router) или Vite + React Router |
| Schema & Validation | Zod |
| Server State | TanStack Query (React Query) |
| Client State | Zustand (per-feature stores) |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod resolver |
| API Client | ky или axios с interceptors |
| Linting imports | eslint-plugin-import + eslint-plugin-boundaries (для FSD rules) |

---

# 20. Поток данных: полная картина

```txt
Серверные данные:
API → schema.parse() → query cache → adapter → UIContract → UI component

Пользовательские действия:
UI event → feature action → API mutation → invalidate query → rerender

Формы:
User input → form state → schema.safeParse() → API call → redirect/toast

URL state:
URL params → schema.parse() → page props → widget → query
```

---

# 21. Сравнение: когда что использовать

| Сценарий | Полный Headless DSL | FSD + Headless DSL Lite |
|---|---|---|
| Конструктор лендингов | Да | Нет |
| E-commerce магазин | Нет | Да |
| Admin dashboard | Нет (если не конфигурируемый) | Да |
| No-code платформа | Да | Нет |
| CMS с фиксированными типами | Нет | Да |
| CMS с кастомными типами | Да (registry нужен) | Частично |
| Workflow builder | Да | Нет |
| Типичный SaaS | Нет | Да |

---

# 22. Ментальная модель

> **FSD отвечает за "где". Headless DSL отвечает за "как".**

Короткая формула:

> **Zod валидирует на границе, adapter нормализует для UI, FSD организует код, UIContract стандартизирует пропсы.**

---

# 23. Шпаргалка в 10 правилах

1. Структурируй код по FSD: shared → entities → features → widgets → pages → app.
2. Каждая сущность имеет Zod-схему. Валидируй все внешние данные.
3. API-ответы проходят через `schema.parse()` — всегда.
4. Domain-модель не идет напрямую в UI. Используй adapter → UIContract.
5. Серверные данные — в query cache. UI-состояние — в локальном стейте.
6. Feature — это действие пользователя, не сущность. Не путай.
7. Widget собирает entities + features в один блок. Это место для координации.
8. Page — только композиция виджетов и роутинг. Без логики.
9. Public API (`index.ts`) обязателен для каждого слайса.
10. Новая сущность = новый slice, без правок в существующем коде.

---

# 24. Шаблон RFC для нового проекта

```md
# RFC: SPA Architecture for [Project Name]

## Problem
Нужна масштабируемая архитектура для [e-commerce / admin panel / CMS].

## Goals
- FSD structure for code organization
- schema-first validation (Zod)
- adapter pattern for UI isolation
- clear data flow: API → schema → cache → adapter → UI

## Stack
- Next.js / Vite + React
- Zod + TanStack Query + Zustand
- Tailwind CSS

## Entity list
- Product, Order, User, Category, ...

## Feature list
- add-to-cart, filter-products, auth, manage-products, ...

## Non-goals
- dynamic entity types (no full registry needed)
- visual constructor / DSL editor

## Trade-offs
+ predictable structure
+ easy onboarding
+ type-safe boundaries
- upfront setup time
- more files (but smaller and focused)
```
