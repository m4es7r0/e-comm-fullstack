# Phase 5: DevOps & Polish (Week 10)

Цель: контейнеризация всех сервисов, CI/CD pipeline, деплой на Dokploy, мониторинг.

**Prerequisites**: Phase 1–4 завершены, все приложения работают локально.

---

## 5.1 Dockerfiles (Multi-stage Builds)

### 5.1.1 Backend Dockerfile
- `infrastructure/docker/backend.Dockerfile`:
  - **Stage 1 (deps)**: pnpm install --frozen-lockfile (только workspace deps)
  - **Stage 2 (build)**: `prisma generate` + `tsc` compile
  - **Stage 3 (runtime)**: Node 20 Alpine, copy built files + node_modules (production only)
  - Entrypoint: `node dist/server.js`
  - Health check: `curl -f http://localhost:3001/api/health`

### 5.1.2 Frontend Dockerfile
- `infrastructure/docker/frontend.Dockerfile`:
  - **Stage 1 (deps)**: pnpm install
  - **Stage 2 (build)**: `next build` (standalone output)
  - **Stage 3 (runtime)**: Node 20 Alpine, copy `.next/standalone` + `.next/static` + `public`
  - Entrypoint: `node server.js`
  - Next.js standalone output mode в `next.config.ts`

### 5.1.3 CMS Dockerfile
- `infrastructure/docker/cms.Dockerfile`:
  - **Stage 1 (deps)**: pnpm install
  - **Stage 2 (build)**: `vite build`
  - **Stage 3 (runtime)**: nginx Alpine, copy `dist/` to `/usr/share/nginx/html`
  - nginx config: SPA fallback (all routes → index.html)

### 5.1.4 .dockerignore
- Общий `.dockerignore`: node_modules, .git, .env, dist, .next, coverage

**Definition of Done**: Каждый Dockerfile собирается и запускается отдельно. Image sizes < 200MB.

---

## 5.2 Docker Compose Production

### 5.2.1 Production compose
- `infrastructure/docker/docker-compose.prod.yml`:
  - Все сервисы из dev + apps (backend, frontend, cms)
  - Traefik reverse proxy:
    - `frontend.localhost` → frontend:3000
    - `cms.localhost` → cms:80
    - `api.localhost` → backend:3001
    - MinIO Console: `minio.localhost` → minio:9001
  - Traefik dashboard: `traefik.localhost`
  - Network: `ecomm-network`
  - Restart policies: `unless-stopped`

### 5.2.2 Environment management
- `.env.production.example`:
  - Strong passwords, proper JWT secrets
  - Production URLs
  - MinIO proper credentials
- Secrets management через Docker secrets или env file

### 5.2.3 Database migrations in production
- Backend entrypoint script:
  ```sh
  #!/bin/sh
  npx prisma migrate deploy
  node dist/server.js
  ```
- Миграции запускаются автоматически при старте контейнера

**Definition of Done**: `docker compose -f docker-compose.prod.yml up` — полный стек работает с Traefik routing.

---

## 5.3 Dokploy Deployment

### 5.3.1 Dokploy setup
- Установить Dokploy на VPS (self-hosted)
- Создать проект `e-commerce`
- Настроить Git integration (GitHub webhook)

### 5.3.2 Application configurations
- **Backend** application:
  - Source: GitHub repo, path `apps/backend`
  - Dockerfile: `infrastructure/docker/backend.Dockerfile`
  - Environment variables через Dokploy UI
  - Domain: `api.yourdomain.com`
  - Auto-deploy on push to `main`
- **Frontend** application:
  - Source: GitHub repo
  - Dockerfile: `infrastructure/docker/frontend.Dockerfile`
  - Domain: `shop.yourdomain.com`
- **CMS** application:
  - Source: GitHub repo
  - Dockerfile: `infrastructure/docker/cms.Dockerfile`
  - Domain: `admin.yourdomain.com`

### 5.3.3 Services (managed by Dokploy)
- **PostgreSQL**: Dokploy managed database service
- **Redis**: Dokploy managed Redis service
- **MinIO**: Docker compose service (или отдельный Dokploy application)

### 5.3.4 SSL & Domains
- Dokploy + Traefik: automatic Let's Encrypt SSL
- Domains: `api.`, `shop.`, `admin.` субдомены
- Force HTTPS redirect

**Definition of Done**: Push to main → auto-deploy → all services accessible via HTTPS.

---

## 5.4 CI/CD Pipeline (GitHub Actions)

### 5.4.1 CI workflow
- `.github/workflows/ci.yml`:
  - Trigger: push to `main`, PR to `main`
  - **Steps**:
    1. Checkout
    2. Setup pnpm + Node 20
    3. `pnpm install --frozen-lockfile`
    4. `pnpm turbo lint` — ESLint all packages
    5. `pnpm turbo type-check` — TypeScript all packages
    6. `pnpm turbo test` — Vitest all packages
    7. `pnpm turbo build` — build all packages and apps

### 5.4.2 Deploy workflow
- `.github/workflows/deploy.yml`:
  - Trigger: push to `main` (after CI passes)
  - **Steps**:
    1. Trigger Dokploy webhook for each app
    2. (или) Build Docker images → push to registry → Dokploy pulls
  - Alternatively: Dokploy's built-in Git integration handles this

### 5.4.3 PR checks
- Required status checks: ci (lint + type-check + test + build)
- Branch protection on `main`

**Definition of Done**: PR создаёт CI check, merge в main триггерит deploy.

---

## 5.5 Monitoring & Logging

### 5.5.1 Structured logging
- Backend: consola (уже в qore) с JSON output в production
- Log levels: error в prod, info в staging, debug в dev
- Request logging: method, url, status, duration

### 5.5.2 Health checks
- `GET /api/health` — уже есть
- Расширить: DB connection time, Redis ping, S3 bucket access
- Docker health checks в compose файлах

### 5.5.3 Error tracking (optional, v2)
- Sentry integration (free tier)
- Backend: Fastify error handler → report to Sentry
- Frontend: Next.js error boundary → report to Sentry

### 5.5.4 Uptime monitoring (optional)
- UptimeRobot / Better Uptime (free tier)
- Monitor: health endpoint, frontend, cms

**Definition of Done**: Логи структурированы, health checks работают, errors отслеживаются.

---

## 5.6 Security Hardening

### 5.6.1 Backend security
- Helmet headers (via `@fastify/helmet`)
- CORS: whitelist only frontend + CMS domains
- Rate limiting: strict на auth endpoints (5 req/min), relaxed на reads
- Input validation: Zod on all endpoints (уже есть)
- SQL injection: Prisma parameterized queries (by default)
- Password: bcrypt with cost factor 12

### 5.6.2 Infrastructure security
- PostgreSQL: strong password, not exposed to host in prod
- MinIO: proper access keys, bucket policies
- Redis: password in prod
- JWT secret: long random string (min 256 bit)
- HTTPS everywhere (Traefik + Let's Encrypt)

### 5.6.3 Docker security
- Non-root user в Dockerfiles
- Read-only filesystem where possible
- No privileged containers
- Minimal base images (Alpine)

**Definition of Done**: Security checklist пройден, no exposed secrets, HTTPS only.

---

## 5.7 Performance Optimization

### 5.7.1 Backend
- Database indexes: product(slug), product(categoryId), product(status), order(userId), user(email)
- Query optimization: include only needed relations
- Response compression (gzip)
- Connection pooling: Prisma default

### 5.7.2 Frontend
- Next.js Image optimization
- Code splitting (dynamic imports для heavy pages)
- Prefetching: `<Link prefetch>` для navigation
- Static generation где возможно (category pages)
- Bundle analysis: `@next/bundle-analyzer`

### 5.7.3 CMS
- Lazy loading routes (React.lazy + Suspense)
- Vite chunk splitting
- Image lazy loading в таблицах

**Definition of Done**: Lighthouse Performance > 80, API response < 100ms для lists.

---

## 5.8 Verification Checklist

- [ ] Docker: все 3 Dockerfiles собираются < 200MB each
- [ ] Docker Compose prod: полный стек с Traefik поднимается одной командой
- [ ] Domains: frontend, cms, api доступны через Traefik
- [ ] SSL: HTTPS работает (Let's Encrypt или self-signed для local)
- [ ] CI: GitHub Actions lint + type-check + test + build — green
- [ ] Deploy: push to main → auto-deploy через Dokploy
- [ ] Health: `/api/health` проверяет DB + Redis + S3
- [ ] Logs: structured JSON logs в production
- [ ] Security: Helmet, CORS, rate limiting, strong passwords
- [ ] Performance: Lighthouse > 80, API < 100ms
- [ ] DB indexes: created for frequent queries
- [ ] Seed: production seed script для initial admin user
