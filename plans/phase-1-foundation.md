# Phase 1: Foundation (Week 1–2)

Цель: настроить монорепо, инфраструктуру, shared-пакеты, и поднять backend с базовым CRUD.

---

## 1.1 Monorepo Setup

### 1.1.1 Инициализация pnpm workspace
- Инициализировать корневой `package.json` с `"private": true`
- Создать `pnpm-workspace.yaml` с путями `apps/*` и `packages/*`
- Настроить `.npmrc` (`shamefully-hoist=true`, `strict-peer-dependencies=false`)

### 1.1.2 Turborepo
- Установить `turbo` как devDependency в корень
- Создать `turbo.json` с pipeline:
  - `build` — зависит от `^build` (сначала пакеты, потом apps)
  - `dev` — persistent, parallel
  - `lint` — без зависимостей
  - `test` — зависит от `^build`
  - `type-check` — зависит от `^build`

### 1.1.3 Shared конфиги
- `packages/config/tsconfig.base.json` — базовый TS config (ES2022, strict, paths)
- `packages/config/tsconfig.node.json` — для backend (target: ES2022, module: NodeNext)
- `packages/config/tsconfig.react.json` — для frontend/cms (JSX: react-jsx)
- `packages/config/.eslintrc.base.js` — общие ESLint правила
- `packages/config/.prettierrc` — Prettier config

### 1.1.4 Структура директорий
```
e-comm-fullstack/
├── apps/
│   ├── backend/
│   ├── frontend/
│   └── cms/
├── packages/
│   ├── qore/
│   ├── contracts/
│   └── config/
├── infrastructure/
│   └── docker/
├── plans/                  # ← эти планы
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── .gitignore
├── .env.example
└── .nvmrc                  # Node 20 LTS
```

**Definition of Done**: `pnpm install` проходит без ошибок, `pnpm turbo build` пустой но рабочий pipeline.

---

## 1.2 Packages: contracts

### 1.2.1 Scaffold пакета
- `packages/contracts/package.json` (name: `@ecomm/contracts`, type: module)
- `packages/contracts/tsconfig.json` (extends base)
- `packages/contracts/src/index.ts`

### 1.2.2 Entity schemas (Zod)
- `src/entities/product.ts`:
  - `ProductSchema`, `CreateProductSchema`, `UpdateProductSchema`
  - Type exports: `Product`, `CreateProductInput`, `UpdateProductInput`
- `src/entities/category.ts`:
  - `CategorySchema`, `CreateCategorySchema`
  - Types: `Category`, `CreateCategoryInput`
- `src/entities/user.ts`:
  - `UserSchema`, `PublicUserSchema` (без passwordHash)
  - `RegisterInputSchema`, `LoginInputSchema`
  - Types: `User`, `PublicUser`, `RegisterInput`, `LoginInput`
- `src/entities/order.ts`:
  - `OrderSchema`, `OrderItemSchema`, `CreateOrderSchema`
  - Types: `Order`, `OrderItem`, `CreateOrderInput`
- `src/entities/cart.ts`:
  - `CartItemSchema`, `CartSchema`
  - Types: `CartItem`, `Cart`

### 1.2.3 API types
- `src/api/responses.ts`:
  - `ApiResponseSchema<T>` — `{ data: T, meta?: Record }`
  - `ApiErrorBodySchema` — `{ message, code?, status?, details? }`
  - `PaginatedResponseSchema<T>` — extends ApiResponse + pagination meta
- `src/api/pagination.ts`:
  - `PaginationParamsSchema` — `{ page, perPage, sort?, direction? }`
  - Type: `PaginationParams`
- `src/api/endpoints.ts`:
  - Константы всех API путей: `ENDPOINTS.products.list`, `ENDPOINTS.auth.login`, etc.

### 1.2.4 Auth types
- `src/auth/tokens.ts`:
  - `JWTPayloadSchema` — `{ userId, role, email }`
  - `TokenPairSchema` — `{ accessToken, refreshToken }`

### 1.2.5 Shared contracts (для frontend)
- `src/ui/contracts.ts`:
  - `UIState`, `UIActions`, `UIContract` types
  - `ListMeta`, `ListState`, `ListContract` types
  - `FormState`, `FormContract`, `FieldError` types
  - (Переносим из architecture guide)

### 1.2.6 Barrel exports
- `src/index.ts` — реэкспорт всего публичного API

**Definition of Done**: `pnpm --filter @ecomm/contracts build` проходит, типы экспортируются, другие пакеты могут импортировать.

---

## 1.3 Packages: qore

### 1.3.1 Перенос qore в монорепо
- Скопировать `src/` из текущего qore репо
- Обновить `package.json`: name → `@ecomm/qore`, добавить peer deps
- Обновить `tsconfig.json` (extends base)
- Проверить что все exports работают из монорепо

**Definition of Done**: `import { createApiClient } from '@ecomm/qore'` работает в apps.

---

## 1.4 Docker Infrastructure

### 1.4.1 Docker Compose для локальной разработки
- `infrastructure/docker/docker-compose.yml`:
  - **postgres**: PostgreSQL 16 Alpine, port 5432, volume для данных
  - **minio**: MinIO latest, ports 9000 (S3 API) + 9001 (Console), volume
  - **redis**: Redis 7 Alpine, port 6379
- Создать `infrastructure/docker/init-minio.sh` — скрипт для создания bucket `ecommerce-assets` при первом запуске

### 1.4.2 Environment variables
- `.env.example` с полным списком переменных
- `.env` (gitignored) с локальными значениями по умолчанию

### 1.4.3 Makefile / scripts
- Корневой `Makefile` или `scripts` в package.json:
  - `infra:up` — `docker compose up -d` (только инфраструктура)
  - `infra:down` — остановка
  - `infra:reset` — остановка + удаление volumes
  - `dev` — `turbo dev` (запуск всех apps)

**Definition of Done**: `pnpm infra:up` поднимает PostgreSQL + MinIO + Redis, MinIO Console доступен на localhost:9001.

---

## 1.5 Backend Scaffold

### 1.5.1 Инициализация Fastify приложения
- `apps/backend/package.json`:
  - Dependencies: `fastify`, `@fastify/cors`, `@fastify/cookie`, `@fastify/multipart`, `@fastify/rate-limit`, `@fastify/swagger`, `@fastify/swagger-ui`
  - Dev: `tsx`, `vitest`, `@types/node`
  - Scripts: `dev`, `build`, `start`, `test`
- `apps/backend/tsconfig.json` (extends node config)
- `apps/backend/src/server.ts` — entry point
- `apps/backend/src/app.ts` — Fastify instance factory:
  - Register plugins: cors, cookie, rate-limit, swagger
  - Register custom plugins: prisma, error-handler
  - Register route modules

### 1.5.2 Prisma Setup
- `apps/backend/prisma/schema.prisma`:
  - Полная схема из ARCHITECTURE_PLAN.md (User, Category, Product, Order, OrderItem)
  - Enums: Role, ProductStatus, OrderStatus
- Выполнить `prisma migrate dev --name init` — создать первую миграцию
- `apps/backend/src/lib/prisma.ts` — PrismaClient singleton
- `apps/backend/src/plugins/prisma.ts` — Fastify plugin, декорирует `fastify.prisma`

### 1.5.3 Базовые plugins
- `src/plugins/error-handler.ts`:
  - Глобальный `setErrorHandler`
  - Маппинг Prisma errors (P2002 unique, P2025 not found) → ApiErrorBody
  - Zod validation errors → 400 + field details
  - Unknown errors → 500 + generic message
- `src/plugins/auth.ts`:
  - Декоратор `fastify.jwt` для sign/verify
  - `authenticate` preHandler hook
  - `authorize(roles)` preHandler hook

### 1.5.4 Health module
- `src/modules/health/health.routes.ts`:
  - `GET /api/health` → проверка DB connection + basic info
  - Response: `{ status: 'ok', timestamp, db: 'connected', version }`

### 1.5.5 Products module (basic CRUD)
- `src/modules/products/product.service.ts`:
  - `findAll(params)` — paginated, filterable by category/status
  - `findBySlug(slug)`
  - `findById(id)`
  - `create(data)`
  - `update(id, data)`
  - `delete(id)`
- `src/modules/products/product.handlers.ts` — request handlers
- `src/modules/products/product.routes.ts` — route definitions с Zod validation через contracts

### 1.5.6 Categories module (basic CRUD)
- Аналогично products: service → handlers → routes
- `findAll()` — возвращает tree structure (parent/children)
- `findBySlug(slug)` — с products count

### 1.5.7 Seed data
- `apps/backend/prisma/seed.ts`:
  - 3–5 категорий
  - 15–20 продуктов с разными статусами
  - 1 admin user, 2 customer users
  - `npx prisma db seed` в package.json

**Definition of Done**: `pnpm --filter backend dev` запускает сервер, `GET /api/health` возвращает 200, `GET /api/products` возвращает seeded данные с пагинацией.

---

## 1.6 Verification Checklist

- [ ] `pnpm install` — без ошибок
- [ ] `pnpm turbo build` — все пакеты и apps собираются
- [ ] `pnpm turbo type-check` — без TS ошибок
- [ ] Docker: `pnpm infra:up` поднимает PG + MinIO + Redis
- [ ] Backend: `pnpm --filter backend dev` стартует на :3001
- [ ] Health: `curl localhost:3001/api/health` → 200
- [ ] Products: `curl localhost:3001/api/products` → paginated list
- [ ] Categories: `curl localhost:3001/api/categories` → tree
- [ ] MinIO Console: `localhost:9001` — доступен
- [ ] Contracts: import в backend работает, типы совпадают
- [ ] Qore: import из `@ecomm/qore` резолвится
