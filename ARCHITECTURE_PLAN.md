# E-Commerce Fullstack — Architecture & Implementation Plan

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Backend** | Fastify + TypeScript | ~77k req/s, plugin system, built-in JSON Schema, `fastify-type-provider-zod` |
| **Frontend** | Next.js 16 (App Router) | SSR/SSG, React Server Components, streaming |
| **CMS** | React SPA (Vite) | Lightweight admin, fast HMR, FSD architecture |
| **API Layer** | qore (shared package) | ky + TanStack Query + middleware + cache strategies |
| **ORM** | Prisma | Auto-generated types, declarative schema, migrations |
| **Database** | PostgreSQL 16 | JSONB for product attributes, full-text search, reliability |
| **Object Storage** | MinIO (S3-compatible) | Self-hosted, 1:1 AWS S3 API compatibility |
| **Monorepo** | pnpm workspaces + Turborepo | Shared types/contracts, parallel builds, single CI |
| **DevOps** | Docker Compose → Dokploy | Local dev in Docker, self-hosted PaaS for staging/prod |
| **Validation** | Zod | Schema-first validation on all boundaries (API, forms, URL params) |
| **Auth** | JWT (access + refresh tokens) | Stateless, scalable, standard for SPA + API |

---

## 2. Monorepo Structure

```
e-comm-fullstack/
├── apps/
│   ├── backend/                 # Fastify API server
│   ├── frontend/                # Next.js 16 storefront
│   └── cms/                     # React SPA admin panel (Vite)
│
├── packages/
│   ├── qore/                    # API client layer (existing)
│   ├── contracts/               # Shared Zod schemas, types, DTOs
│   ├── config/                  # Shared ESLint, TSConfig, Prettier
│   └── ui/                      # Shared UI primitives (optional, for CMS/Frontend overlap)
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml        # Local dev: all services
│   │   ├── docker-compose.prod.yml   # Production-like setup
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── cms.Dockerfile
│   └── dokploy/
│       └── dokploy-compose.yml       # Dokploy deployment config
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── .env.example
```

---

## 3. Shared Contracts Package (`packages/contracts`)

Ключевой пакет — единый источник правды для типов между backend, frontend и CMS.

```
packages/contracts/
├── src/
│   ├── entities/
│   │   ├── product.ts           # ProductSchema, Product type, CreateProductInput, UpdateProductInput
│   │   ├── category.ts          # CategorySchema, Category type
│   │   ├── user.ts              # UserSchema, User type, RegisterInput, LoginInput
│   │   ├── order.ts             # OrderSchema, Order type, CreateOrderInput
│   │   ├── cart.ts              # CartSchema, CartItem type
│   │   └── review.ts            # ReviewSchema, Review type
│   ├── api/
│   │   ├── responses.ts         # ApiResponse<T>, PaginatedResponse<T>, ApiErrorBody
│   │   ├── pagination.ts        # PaginationParams schema
│   │   └── endpoints.ts         # Endpoint path constants
│   ├── auth/
│   │   └── tokens.ts            # TokenPair, JWTPayload schemas
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Принцип**: Zod-схемы определяются один раз в `contracts`. Backend использует их для валидации request/response. Frontend/CMS используют их для type inference и клиентской валидации форм. Это гарантирует, что типы никогда не рассинхронизируются.

---

## 4. Backend Architecture (`apps/backend`)

### 4.1. Structure

```
apps/backend/
├── src/
│   ├── app.ts                   # Fastify instance, plugin registration
│   ├── server.ts                # Entry point, listen
│   ├── plugins/
│   │   ├── auth.ts              # JWT verify/decode decorator
│   │   ├── prisma.ts            # Prisma client plugin
│   │   ├── s3.ts                # MinIO/S3 client plugin
│   │   ├── cors.ts              # CORS config
│   │   └── error-handler.ts     # Global error handler → ApiErrorBody
│   ├── modules/
│   │   ├── products/
│   │   │   ├── product.routes.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.handlers.ts
│   │   │   └── product.test.ts
│   │   ├── categories/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts    # register, login, refresh, logout
│   │   │   └── auth.handlers.ts
│   │   ├── users/
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── upload/                # S3 presigned URLs, image upload
│   │   └── health/
│   ├── middleware/
│   │   ├── authenticate.ts        # JWT guard (preHandler hook)
│   │   ├── authorize.ts           # Role-based access (admin/user)
│   │   └── rate-limit.ts
│   ├── lib/
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── s3.ts                  # S3Client config
│   │   ├── password.ts            # bcrypt hash/verify
│   │   ├── tokens.ts              # JWT sign/verify helpers
│   │   └── pagination.ts          # Prisma pagination helper
│   └── generated/
│       └── prisma/                # Prisma generated client
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                    # Demo data seeder
├── package.json
└── tsconfig.json
```

### 4.2. Module Pattern

Каждый модуль — автономный Fastify plugin:

```ts
// modules/products/product.routes.ts
import { FastifyPluginAsync } from 'fastify'
import { ProductSchema, CreateProductInput } from '@ecomm/contracts'
import { ProductService } from './product.service'

const productRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new ProductService(fastify.prisma)

  fastify.get('/products', {
    schema: {
      querystring: PaginationParamsSchema,
      response: { 200: PaginatedProductResponseSchema }
    }
  }, async (req, reply) => {
    const result = await service.findAll(req.query)
    return reply.send(result)
  })

  fastify.get('/products/:id', async (req, reply) => {
    const product = await service.findById(req.params.id)
    return reply.send({ data: product })
  })

  // POST/PUT/DELETE — protected by authenticate + authorize('admin')
}
```

### 4.3. Prisma Schema (Core Models)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String?
  lastName      String?
  role          Role     @default(CUSTOMER)
  orders        Order[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Role {
  CUSTOMER
  ADMIN
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  parentId    String?
  parent      Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  description     String
  price           Decimal  @db.Decimal(10, 2)
  compareAtPrice  Decimal? @db.Decimal(10, 2)
  currency        String   @default("USD")
  images          String[]
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id])
  status          ProductStatus @default(DRAFT)
  stock           Int      @default(0)
  attributes      Json     @default("{}")
  orderItems      OrderItem[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  items       OrderItem[]
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  shippingAddress Json
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
}
```

### 4.4. API Endpoints

```
Auth:
  POST   /api/auth/register          # Register new user
  POST   /api/auth/login             # Login → access + refresh tokens
  POST   /api/auth/refresh           # Refresh access token
  POST   /api/auth/logout            # Invalidate refresh token

Products:
  GET    /api/products               # List (paginated, filterable)
  GET    /api/products/:slug         # Detail by slug
  POST   /api/products               # Create (admin)
  PUT    /api/products/:id           # Update (admin)
  DELETE /api/products/:id           # Delete (admin)

Categories:
  GET    /api/categories             # List (tree structure)
  GET    /api/categories/:slug       # Detail with products
  POST   /api/categories             # Create (admin)
  PUT    /api/categories/:id         # Update (admin)
  DELETE /api/categories/:id         # Delete (admin)

Users:
  GET    /api/users/me               # Current user profile
  PUT    /api/users/me               # Update profile
  GET    /api/users                  # List users (admin)

Orders:
  POST   /api/orders                 # Create order (checkout)
  GET    /api/orders                 # User's order history
  GET    /api/orders/:id             # Order detail
  PUT    /api/orders/:id/status      # Update status (admin)

Upload:
  POST   /api/upload/presign         # Get presigned URL for S3 upload
  POST   /api/upload/confirm         # Confirm upload, save reference

Health:
  GET    /api/health                 # Service health + DB + S3
```

---

## 5. Frontend Architecture (`apps/frontend`) — Next.js 16

### 5.1. Structure (FSD + App Router)

```
apps/frontend/
├── src/
│   ├── app/                          # Next.js App Router (routing only)
│   │   ├── (shop)/
│   │   │   ├── page.tsx              # → pages/home
│   │   │   ├── catalog/
│   │   │   │   └── page.tsx          # → pages/catalog
│   │   │   ├── catalog/[slug]/
│   │   │   │   └── page.tsx          # → pages/catalog-category
│   │   │   ├── product/[slug]/
│   │   │   │   └── page.tsx          # → pages/product-detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          # → pages/cart
│   │   │   └── checkout/
│   │   │       └── page.tsx          # → pages/checkout
│   │   ├── (account)/
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # → pages/profile
│   │   │   └── orders/
│   │   │       ├── page.tsx          # → pages/order-history
│   │   │       └── [id]/page.tsx     # → pages/order-detail
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── layout.tsx
│   │   └── providers.tsx             # QueryClient, theme, auth context
│   │
│   ├── pages/                        # FSD pages layer (NOT Next.js pages dir)
│   │   ├── home/
│   │   ├── catalog/
│   │   ├── product-detail/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── profile/
│   │   ├── order-history/
│   │   └── auth/
│   │
│   ├── widgets/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── product-catalog/          # Grid + Filters + Sort + Pagination
│   │   ├── product-detail/           # Images + Info + AddToCart + Reviews
│   │   ├── cart-sidebar/
│   │   ├── checkout-form/
│   │   └── order-table/
│   │
│   ├── features/
│   │   ├── add-to-cart/
│   │   ├── filter-products/
│   │   ├── search-products/
│   │   ├── checkout-flow/
│   │   └── auth/
│   │       ├── login/
│   │       └── register/
│   │
│   ├── entities/
│   │   ├── product/
│   │   │   ├── model/types.ts         # Re-export from @ecomm/contracts
│   │   │   ├── api/                   # qore: actions, queries, cache strategies
│   │   │   │   ├── product.actions.ts
│   │   │   │   ├── product.queries.ts # createQueryKeys
│   │   │   │   └── product.cache.ts   # createCacheStrategy
│   │   │   ├── lib/adapter.ts         # domain → UIContract
│   │   │   ├── ui/                    # ProductCard, ProductRow, ProductBadge
│   │   │   └── index.ts              # Public API
│   │   ├── category/
│   │   ├── order/
│   │   ├── user/
│   │   └── cart/
│   │
│   └── shared/
│       ├── ui/                        # Button, Input, Modal, Table, Skeleton
│       ├── contracts/                 # UIContract, ListContract, FormContract
│       ├── api/                       # qore client instance, endpoints
│       │   ├── client.ts             # createApiClient({ prefixUrl })
│       │   └── endpoints.ts          # from @ecomm/contracts
│       ├── lib/                       # formatPrice, cn(), debounce
│       └── config/                    # env, routes
│
├── public/
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

### 5.2. Qore Integration in Entity API Layer

```ts
// entities/product/api/product.queries.ts
import { createQueryKeys } from 'qore'
import { getProducts, getProductBySlug } from './product.actions'

export const productQueries = createQueryKeys('products', (q) => ({
  list: q.scope('list').query(
    (params: { page?: number; categoryId?: string }) => params,
    (params) => getProducts(params)
  ),
  detail: q.scope('detail').query(
    (slug: string) => slug,
    (slug) => getProductBySlug(slug)
  ),
}))

// Usage in widget:
// useQuery(productQueries.list({ page: 1, categoryId: 'abc' }))
// useQuery(productQueries.detail('cool-product'))
```

```ts
// entities/product/api/product.cache.ts
import { createCacheStrategy, cacheUpdate } from 'qore'
import { productQueries } from './product.queries'

export const addProductCache = createCacheStrategy({
  invalidate: () => [productQueries.list.queryKey],
})

export const updateProductCache = createCacheStrategy({
  invalidate: (vars) => [
    productQueries.list.queryKey,
    productQueries.detail(vars.slug).queryKey,
  ],
  optimistic: [
    cacheUpdate(productQueries.detail, (vars, old) => ({
      ...old,
      ...vars,
    })),
  ],
})
```

---

## 6. CMS Architecture (`apps/cms`) — React SPA (Vite)

### 6.1. Structure (FSD)

```
apps/cms/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── layouts/                   # DashboardLayout, AuthLayout
│   │   ├── router.tsx                 # React Router (SPA routing)
│   │   └── index.tsx
│   │
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── products/                  # List + Create + Edit
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── users/
│   │   └── auth/login/
│   │
│   ├── widgets/
│   │   ├── sidebar/
│   │   ├── data-table/               # Generic table with sort/filter/pagination
│   │   ├── entity-form/              # Generic form driven by schema
│   │   └── dashboard-stats/
│   │
│   ├── features/
│   │   ├── manage-products/           # CRUD actions
│   │   ├── manage-categories/
│   │   ├── manage-orders/
│   │   ├── manage-users/
│   │   ├── upload-images/
│   │   └── auth/
│   │
│   ├── entities/
│   │   ├── product/                   # Same pattern as frontend
│   │   ├── category/
│   │   ├── order/
│   │   └── user/
│   │
│   └── shared/
│       ├── ui/                        # Admin UI kit
│       ├── contracts/
│       ├── api/                       # qore client (same lib, different prefixUrl)
│       ├── lib/
│       └── config/
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

CMS использует тот же qore и те же contracts, но с другим `createApiClient({ prefixUrl: '/api/admin' })` и admin-специфичными UI-компонентами (таблицы, формы, bulk actions).

---

## 7. Infrastructure & DevOps

### 7.1. Docker Compose (Local Development)

```yaml
# infrastructure/docker/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: ecomm
      POSTGRES_PASSWORD: ecomm_local
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"     # S3 API
      - "9001:9001"     # Console UI
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build:
      context: ../../
      dockerfile: infrastructure/docker/backend.Dockerfile
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://ecomm:ecomm_local@postgres:5432/ecommerce
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
      S3_BUCKET: ecommerce-assets
      JWT_SECRET: local-dev-secret
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, minio, redis]

  frontend:
    build:
      context: ../../
      dockerfile: infrastructure/docker/frontend.Dockerfile
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    depends_on: [backend]

  cms:
    build:
      context: ../../
      dockerfile: infrastructure/docker/cms.Dockerfile
    ports: ["3002:3002"]
    environment:
      VITE_API_URL: http://localhost:3001/api
    depends_on: [backend]

volumes:
  postgres_data:
  minio_data:
```

### 7.2. Dokploy Deployment

Dokploy (self-hosted PaaS on your VPS) will orchestrate the same services:
- Each app gets its own Dokploy "Application" with its Dockerfile
- PostgreSQL and MinIO run as Dokploy "Services" (managed databases)
- Redis as a Dokploy service for session/cache
- Traefik (built into Dokploy) handles reverse proxy + SSL
- Environment variables managed through Dokploy UI

### 7.3. Deployment Flow

```
Local Dev:  docker compose up → all services on localhost
Staging:    git push → Dokploy auto-build → deploy to VPS
Production: Dokploy manual promote / separate compose
```

---

## 8. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│                                                                   │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │   Frontend    │    │     CMS      │    │   Mobile     │      │
│   │  (Next.js)   │    │ (React SPA)  │    │  (future)    │      │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│          │                    │                    │              │
│          └────────────┬───────┘────────────────────┘              │
│                       │                                           │
│              ┌────────┴────────┐                                  │
│              │      qore       │  ← shared API layer              │
│              │  (ky + TanStack │     middleware, error handling    │
│              │   Query + cache │     query keys, cache strategies  │
│              │    strategies)  │                                   │
│              └────────┬────────┘                                  │
└───────────────────────┼──────────────────────────────────────────┘
                        │ HTTP (JSON)
┌───────────────────────┼──────────────────────────────────────────┐
│                  BACKEND (Fastify)                                │
│                       │                                           │
│   ┌───────────────────┴───────────────────┐                      │
│   │            Route Handlers              │                      │
│   │  Zod validation (from @ecomm/contracts)│                      │
│   └───────────────────┬───────────────────┘                      │
│                       │                                           │
│   ┌───────────────────┴───────────────────┐                      │
│   │            Service Layer               │                      │
│   │  Business logic, authorization         │                      │
│   └────────┬──────────────────┬───────────┘                      │
│            │                  │                                    │
│   ┌────────┴────────┐ ┌──────┴───────┐                           │
│   │  Prisma (ORM)   │ │  S3 Client   │                           │
│   └────────┬────────┘ └──────┬───────┘                           │
└────────────┼─────────────────┼───────────────────────────────────┘
             │                 │
     ┌───────┴───────┐  ┌─────┴──────┐
     │  PostgreSQL   │  │   MinIO    │
     │   (data)      │  │  (files)   │
     └───────────────┘  └────────────┘
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. **Monorepo setup**: pnpm workspaces, Turborepo, shared configs (ESLint, TS, Prettier)
2. **`packages/contracts`**: Zod schemas for all entities, API response types, endpoint constants
3. **`packages/qore`**: Move existing qore into monorepo as internal package
4. **Docker Compose**: PostgreSQL + MinIO + Redis running locally
5. **Backend scaffold**: Fastify app, Prisma schema, migrations, seed data
6. **Health endpoint + basic CRUD** for products and categories

### Phase 2: Backend Core (Week 3-4)
1. **Auth module**: register, login, JWT (access + refresh), role-based guards
2. **All CRUD modules**: products, categories, users, orders
3. **S3 upload**: presigned URL flow for product images
4. **Pagination, filtering, sorting** — generic helpers
5. **Error handling**: global handler mapping to `ApiErrorBody` from contracts
6. **API tests**: Vitest + supertest for each module

### Phase 3: Frontend (Week 5-7)
1. **Next.js 16 scaffold** with FSD structure
2. **Shared UI kit**: Button, Input, Modal, Skeleton (Tailwind)
3. **qore integration**: client instance, entity queries/cache strategies
4. **Pages**: Home, Catalog (with filters), Product Detail, Cart, Checkout
5. **Auth flow**: Login/Register forms, token storage, protected routes
6. **Profile + Order History** pages
7. **SSR/SSG** optimization for catalog and product pages

### Phase 4: CMS (Week 8-9)
1. **Vite + React SPA scaffold** with FSD structure
2. **Admin auth** (same JWT, role=ADMIN guard)
3. **Dashboard**: stats overview (orders count, revenue, etc.)
4. **CRUD pages**: Products, Categories, Orders, Users
5. **Image upload** with S3 presigned URLs
6. **Data tables** with sort, filter, pagination (reusable widget)

### Phase 5: DevOps & Polish (Week 10)
1. **Dockerfiles** for all three apps (multi-stage builds)
2. **Docker Compose** production config
3. **Dokploy setup**: deploy to VPS, configure domains, SSL
4. **CI pipeline** (GitHub Actions): lint → test → build → deploy
5. **Monitoring basics**: health checks, structured logging

---

## 10. Key Architectural Decisions

### 10.1. Contracts as Single Source of Truth
Zod schemas live in `packages/contracts`. Backend uses them for request validation. Frontend/CMS infer TypeScript types from them. This eliminates drift between API and clients.

### 10.2. qore Reused Across Both Clients
Both frontend and CMS import from `packages/qore`. Each creates its own `apiClient` with different `prefixUrl` and potentially different middleware (e.g., CMS adds admin auth header).

### 10.3. FSD for Both Client Apps
Frontend and CMS follow the same FSD structure. The entity layer is similar (same domain models), but features and widgets differ (storefront features vs admin CRUD features).

### 10.4. Adapter Pattern Everywhere
Domain models from API never go directly to UI components. Adapters in `entities/*/lib/adapter.ts` transform domain → UIContract. This keeps UI components pure and testable.

### 10.5. Auth Strategy
- JWT access token (short-lived, 15min) in memory (not localStorage)
- Refresh token (long-lived, 7d) in httpOnly cookie
- Backend middleware: `authenticate` (verify JWT) → `authorize(role)` (check permissions)
- qore middleware: auto-attach access token, auto-refresh on 401

### 10.6. S3 Upload Flow
1. CMS/Frontend requests presigned PUT URL from backend
2. Client uploads directly to MinIO/S3 using presigned URL
3. Client confirms upload to backend → backend saves reference in DB
4. No file data passes through backend → efficient and scalable
