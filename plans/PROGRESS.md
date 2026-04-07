# E-Commerce Fullstack — Progress Tracker

> Обновляй этот файл по мере выполнения задач. Каждая задача помечается:
> - `[ ]` — не начата
> - `[~]` — в процессе
> - `[x]` — завершена
> - `[!]` — заблокирована (указать причину)

---

## Phase 1: Foundation (Week 1–2)
**Status**: `[~] IN PROGRESS`
**Started**: 2026-04-07
**Completed**: —

### 1.1 Monorepo Setup
- [x] 1.1.1 Инициализация pnpm workspace
- [x] 1.1.2 Turborepo config
- [x] 1.1.3 Shared конфиги (TSConfig, ESLint, Prettier)
- [x] 1.1.4 Структура директорий

### 1.2 Packages: contracts
- [x] 1.2.1 Scaffold пакета
- [x] 1.2.2 Entity schemas (Product, Category, User, Order, Cart)
- [x] 1.2.3 API types (responses, pagination, endpoints)
- [x] 1.2.4 Auth types (JWT payload, tokens)
- [x] 1.2.5 Shared UI contracts (UIContract, ListContract, FormContract)
- [x] 1.2.6 Barrel exports

### 1.3 Packages: qore
- [x] 1.3.1 Перенос qore в монорепо

### 1.4 Docker Infrastructure
- [x] 1.4.1 Docker Compose (PostgreSQL, MinIO, Redis)
- [x] 1.4.2 Environment variables (.env.example)
- [x] 1.4.3 Makefile / scripts (npm scripts in root package.json)

### 1.5 Backend Scaffold
- [x] 1.5.1 Инициализация Fastify приложения
- [x] 1.5.2 Prisma Setup (schema, migration, singleton)
- [x] 1.5.3 Базовые plugins (error-handler, prisma)
- [x] 1.5.4 Health module
- [x] 1.5.5 Products module (basic CRUD)
- [x] 1.5.6 Categories module (basic CRUD)
- [x] 1.5.7 Seed data

### 1.6 Verification (run locally)
- [ ] `pnpm install` без ошибок
- [ ] `pnpm turbo build` проходит
- [ ] Docker infra поднимается
- [ ] `prisma migrate dev` + `prisma db seed`
- [ ] Backend стартует на :3001
- [ ] Health endpoint 200
- [ ] Products/Categories CRUD работает

---

## Phase 2: Backend Core (Week 3–4)
**Status**: `[ ] NOT STARTED`
**Started**: —
**Completed**: —

### 2.1 Auth Module
- [ ] 2.1.1 Password utilities (bcrypt)
- [ ] 2.1.2 Token utilities (JWT sign/verify)
- [ ] 2.1.3 Auth service (register, login, refresh, logout)
- [ ] 2.1.4 Auth routes
- [ ] 2.1.5 Auth middleware (authenticate, authorize)
- [ ] 2.1.6 Redis plugin (token blacklist)

### 2.2 Users Module
- [ ] 2.2.1 User service
- [ ] 2.2.2 User routes (me, profile update, admin list)

### 2.3 Products Module (Full)
- [ ] 2.3.1 Full filtering, sorting, search
- [ ] 2.3.2 Slug generation
- [ ] 2.3.3 Extended routes with validation

### 2.4 Categories Module (Full)
- [ ] 2.4.1 Tree structure, products count
- [ ] 2.4.2 Full routes

### 2.5 Orders Module
- [ ] 2.5.1 Order service (create with transaction, stock management)
- [ ] 2.5.2 Order routes
- [ ] 2.5.3 Order validation (stock, prices, active products)

### 2.6 S3 Upload Module
- [ ] 2.6.1 S3 Client (@aws-sdk)
- [ ] 2.6.2 S3 Plugin
- [ ] 2.6.3 Upload service (presigned URLs)
- [ ] 2.6.4 Upload routes

### 2.7 Generic Helpers
- [ ] 2.7.1 Pagination helper
- [ ] 2.7.2 Zod validation plugin (fastify-type-provider-zod)

### 2.8 Testing
- [ ] 2.8.1 Test setup (vitest, test helpers)
- [ ] 2.8.2 Auth tests
- [ ] 2.8.3 Products tests
- [ ] 2.8.4 Orders tests

### 2.9 Verification
- [ ] Auth full flow works
- [ ] RBAC works (admin/customer)
- [ ] All CRUD endpoints work
- [ ] S3 upload works
- [ ] Tests pass
- [ ] Swagger docs available

---

## Phase 3: Frontend — Next.js 16 (Week 5–7)
**Status**: `[ ] NOT STARTED`
**Started**: —
**Completed**: —

### 3.1 Next.js Scaffold
- [ ] 3.1.1 Инициализация Next.js 16
- [ ] 3.1.2 FSD структура + path aliases
- [ ] 3.1.3 App layer (layout, providers)

### 3.2 Shared Layer
- [ ] 3.2.1 API Client (qore integration)
- [ ] 3.2.2 UI Kit (Button, Input, Modal, Badge, Skeleton, etc.)
- [ ] 3.2.3 Shared utilities (formatPrice, cn, etc.)
- [ ] 3.2.4 Shared contracts
- [ ] 3.2.5 Shared config (env, routes)

### 3.3 Entity Layer
- [ ] 3.3.1 Product entity (actions, queries, cache, adapter, UI)
- [ ] 3.3.2 Category entity
- [ ] 3.3.3 User entity
- [ ] 3.3.4 Order entity
- [ ] 3.3.5 Cart entity

### 3.4 Features Layer
- [ ] 3.4.1 Auth feature (login, register, auth store, token management)
- [ ] 3.4.2 Add to Cart feature (cart store, UI)
- [ ] 3.4.3 Filter Products feature
- [ ] 3.4.4 Search Products feature
- [ ] 3.4.5 Checkout Flow feature

### 3.5 Widgets Layer
- [ ] 3.5.1 Header widget
- [ ] 3.5.2 Footer widget
- [ ] 3.5.3 Product Catalog widget
- [ ] 3.5.4 Product Detail widget
- [ ] 3.5.5 Cart Sidebar widget
- [ ] 3.5.6 Checkout Form widget
- [ ] 3.5.7 Order Table widget

### 3.6 Pages + App Router
- [ ] 3.6.1 Home page
- [ ] 3.6.2 Catalog page (+ category filter)
- [ ] 3.6.3 Product Detail page
- [ ] 3.6.4 Cart page
- [ ] 3.6.5 Checkout page (protected)
- [ ] 3.6.6 Auth pages (login, register)
- [ ] 3.6.7 Profile page (protected)
- [ ] 3.6.8 Order History page (protected)
- [ ] 3.6.9 Order Detail page (protected)

### 3.7 SSR & Performance
- [ ] 3.7.1 Server-side data fetching + TanStack hydration
- [ ] 3.7.2 SEO (meta tags, sitemap, JSON-LD)
- [ ] 3.7.3 Image optimization

### 3.8 Verification
- [ ] All pages render correctly
- [ ] Full shopping flow: browse → cart → checkout → order
- [ ] Auth flow works end-to-end
- [ ] SSR works for catalog/product pages
- [ ] Responsive design
- [ ] FSD import rules followed

---

## Phase 4: CMS — React SPA (Week 8–9)
**Status**: `[ ] NOT STARTED`
**Started**: —
**Completed**: —

### 4.1 Vite + React Scaffold
- [ ] 4.1.1 Инициализация Vite
- [ ] 4.1.2 FSD структура
- [ ] 4.1.3 App layer (router, layouts, providers)

### 4.2 Shared Layer (CMS)
- [ ] 4.2.1 API Client
- [ ] 4.2.2 Admin UI Kit (DataTable, FormField, ImageUpload, etc.)
- [ ] 4.2.3 Generic hooks (useDataTable, useEntityForm, useImageUpload)

### 4.3 Entity Layer (CMS)
- [ ] 4.3.1 Product entity (admin adapters + UI)
- [ ] 4.3.2 Category entity
- [ ] 4.3.3 Order entity
- [ ] 4.3.4 User entity

### 4.4 Features Layer (CMS)
- [ ] 4.4.1 Auth feature (admin login)
- [ ] 4.4.2 Manage Products (create, update, delete)
- [ ] 4.4.3 Manage Categories
- [ ] 4.4.4 Manage Orders (status updates)
- [ ] 4.4.5 Manage Users (view only)
- [ ] 4.4.6 Upload Images (S3 presigned)

### 4.5 Widgets Layer (CMS)
- [ ] 4.5.1 Sidebar widget
- [ ] 4.5.2 Products Table widget
- [ ] 4.5.3 Categories Table widget
- [ ] 4.5.4 Orders Table widget
- [ ] 4.5.5 Users Table widget
- [ ] 4.5.6 Dashboard Stats widget

### 4.6 Pages Layer (CMS)
- [ ] 4.6.1 Login page
- [ ] 4.6.2 Dashboard page
- [ ] 4.6.3 Products pages (list, create, edit)
- [ ] 4.6.4 Categories pages (list, create, edit)
- [ ] 4.6.5 Orders pages (list, detail)
- [ ] 4.6.6 Users page
- [ ] 4.6.7 Router config

### 4.7 Verification
- [ ] Admin login works
- [ ] Full CRUD for products and categories
- [ ] Image upload works
- [ ] Orders management works
- [ ] Dashboard stats show real data
- [ ] Cache invalidation after mutations

---

## Phase 5: DevOps & Polish (Week 10)
**Status**: `[ ] NOT STARTED`
**Started**: —
**Completed**: —

### 5.1 Dockerfiles
- [ ] 5.1.1 Backend Dockerfile (multi-stage)
- [ ] 5.1.2 Frontend Dockerfile (multi-stage + standalone)
- [ ] 5.1.3 CMS Dockerfile (multi-stage + nginx)
- [ ] 5.1.4 .dockerignore

### 5.2 Docker Compose Production
- [ ] 5.2.1 Production compose with Traefik
- [ ] 5.2.2 Environment management
- [ ] 5.2.3 Database migrations in production

### 5.3 Dokploy Deployment
- [ ] 5.3.1 Dokploy setup on VPS
- [ ] 5.3.2 Application configurations (backend, frontend, cms)
- [ ] 5.3.3 Services (PostgreSQL, Redis, MinIO)
- [ ] 5.3.4 SSL & Domains

### 5.4 CI/CD Pipeline
- [ ] 5.4.1 CI workflow (lint, type-check, test, build)
- [ ] 5.4.2 Deploy workflow (Dokploy webhook)
- [ ] 5.4.3 PR checks + branch protection

### 5.5 Monitoring & Logging
- [ ] 5.5.1 Structured logging (JSON in prod)
- [ ] 5.5.2 Extended health checks
- [ ] 5.5.3 Error tracking (optional: Sentry)
- [ ] 5.5.4 Uptime monitoring (optional)

### 5.6 Security Hardening
- [ ] 5.6.1 Backend security (Helmet, CORS, rate limiting)
- [ ] 5.6.2 Infrastructure security (passwords, bucket policies)
- [ ] 5.6.3 Docker security (non-root, minimal images)

### 5.7 Performance
- [ ] 5.7.1 Backend (DB indexes, compression, pooling)
- [ ] 5.7.2 Frontend (code splitting, prefetching, bundle analysis)
- [ ] 5.7.3 CMS (lazy loading, chunk splitting)

### 5.8 Verification
- [ ] All Dockerfiles build successfully
- [ ] Full stack runs via docker compose prod
- [ ] CI pipeline green
- [ ] Deploy to Dokploy works
- [ ] SSL/HTTPS works
- [ ] Lighthouse > 80
- [ ] Security checklist passed

---

## Notes & Decisions Log

> Записывай сюда важные решения и изменения по ходу реализации.

| Date | Decision | Context |
|------|----------|---------|
| 2026-04-07 | Stack finalized | Fastify + Prisma + PG + MinIO + Next.js 16 + Vite React CMS |
| 2026-04-07 | Monorepo chosen | pnpm workspaces + Turborepo |
| 2026-04-07 | Architecture: FSD + Headless DSL | Based on existing architecture guide |
| 2026-04-07 | Qore reused as shared package | Existing API layer library |
| | | |
