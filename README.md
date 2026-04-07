# E-Commerce Fullstack

Fullstack e-commerce проект: интернет-магазин с backend API, storefront, CMS админ-панелью и DevOps инфраструктурой.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Fastify 5 + TypeScript |
| **Frontend** | Next.js 16 (App Router) |
| **CMS** | React SPA (Vite) |
| **API Layer** | qore (ky + TanStack Query + middleware) |
| **ORM** | Prisma 6 |
| **Database** | PostgreSQL 16 |
| **Object Storage** | MinIO (S3-compatible) |
| **Cache** | Redis 7 |
| **Validation** | Zod (shared contracts) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **DevOps** | Docker Compose + Dokploy |

## Architecture

Монорепо с тремя приложениями и shared-пакетами:

```
e-comm-fullstack/
├── apps/
│   ├── backend/          # Fastify API server
│   ├── frontend/         # Next.js 16 storefront (WIP)
│   └── cms/              # React SPA admin panel (WIP)
├── packages/
│   ├── contracts/        # Shared Zod schemas, types, API contracts
│   ├── qore/             # Universal API layer (ky + TanStack Query)
│   └── config/           # Shared TSConfig, ESLint, Prettier
├── infrastructure/
│   └── docker/           # Docker Compose configs
└── plans/                # Implementation plans & progress tracker
```

**Ключевые принципы:**

- **Contracts as Single Source of Truth** — Zod-схемы в `packages/contracts` определяют типы для backend, frontend и CMS одновременно
- **FSD + Headless DSL** — Feature-Sliced Design для структуры кода, адаптеры domain → UIContract для изоляции UI
- **Schema validation на всех границах** — API responses, формы, URL params проходят через Zod parse
- **qore** — composable middleware, нормализация ошибок, type-safe query keys, декларативные cache strategies

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Setup

```bash
# Clone & install
cd e-comm-fullstack
pnpm install

# Copy environment variables
cp .env.example .env
cp .env.example apps/backend/.env

# Start infrastructure (PostgreSQL, Redis, MinIO)
pnpm infra:up

# Generate Prisma client, run migrations, seed database
cd apps/backend
pnpm prisma:generate
pnpm prisma:migrate    # enter migration name: "init"
pnpm prisma:seed
cd ../..

# Start backend
pnpm --filter backend dev
```

### Verify

```bash
# Health check
curl http://localhost:3001/api/health

# Products (paginated, 15 seeded items)
curl http://localhost:3001/api/products

# Products with filters
curl "http://localhost:3001/api/products?status=ACTIVE&sort=price&direction=asc"
curl "http://localhost:3001/api/products?search=iphone"
curl "http://localhost:3001/api/products?minPrice=100&maxPrice=500"

# Single product
curl http://localhost:3001/api/products/iphone-16-pro

# Categories (tree structure)
curl http://localhost:3001/api/categories

# Category with details
curl http://localhost:3001/api/categories/electronics

# Products in category
curl http://localhost:3001/api/categories/phones/products
```

### Infrastructure Commands

```bash
pnpm infra:up       # Start PostgreSQL + Redis + MinIO
pnpm infra:down     # Stop infrastructure
pnpm infra:reset    # Stop + delete all data volumes

pnpm db:migrate     # Run Prisma migrations
pnpm db:seed        # Seed demo data
pnpm db:studio      # Open Prisma Studio (DB GUI)
```

### Development

```bash
pnpm dev            # Start all apps (turbo)
pnpm build          # Build all packages and apps
pnpm type-check     # TypeScript check across monorepo
pnpm lint           # Lint all packages
pnpm test           # Run all tests
pnpm format         # Format with Prettier
```

## Services (Local)

| Service | URL |
|---|---|
| Backend API | http://localhost:3001/api |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin) |
| Prisma Studio | `pnpm db:studio` → http://localhost:5555 |
| PostgreSQL | localhost:5432 (ecomm / ecomm_local) |
| Redis | localhost:6379 |

## Seeded Data

| Entity | Count | Details |
|---|---|---|
| Users | 3 | 1 admin (admin@ecomm.local / admin123), 2 customers |
| Categories | 5 | Electronics (Phones, Laptops), Clothing, Accessories |
| Products | 15 | Mixed statuses: ACTIVE, DRAFT, ARCHIVED |
| Orders | 1 | Sample delivered order for john@example.com |

## API Endpoints

### Health
- `GET /api/health` — service health + DB status

### Products
- `GET /api/products` — list (paginated, filterable by category/status/price/search)
- `GET /api/products/:slug` — detail by slug
- `POST /api/products` — create (admin)
- `PUT /api/products/:id` — update (admin)
- `DELETE /api/products/:id` — delete (admin)

### Categories
- `GET /api/categories` — tree structure
- `GET /api/categories/:slug` — detail + children + product count
- `GET /api/categories/:slug/products` — products in category
- `POST /api/categories` — create (admin)
- `PUT /api/categories/:id` — update (admin)
- `DELETE /api/categories/:id` — delete (admin, fails if has products)

### Auth (Phase 2)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users (Phase 2)
- `GET /api/users/me`
- `PUT /api/users/me`

### Orders (Phase 2)
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

### Upload (Phase 2)
- `POST /api/upload/presign`

## Project Plans

Detailed implementation plans are in `plans/`:

- `PROGRESS.md` — overall progress tracker with checkboxes
- `phase-1-foundation.md` — monorepo, contracts, Docker, backend scaffold ✅
- `phase-2-backend-core.md` — auth, orders, S3 upload, tests
- `phase-3-frontend.md` — Next.js 16 storefront
- `phase-4-cms.md` — React SPA admin panel
- `phase-5-devops.md` — Docker, CI/CD, Dokploy deployment
