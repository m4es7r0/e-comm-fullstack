# Phase 2: Backend Core (Week 3–4)

Цель: полноценный API — auth, все CRUD модули, S3 upload, тесты.

**Prerequisites**: Phase 1 завершена, backend scaffold работает, contracts готовы.

---

## 2.1 Auth Module

### 2.1.1 Password utilities
- `src/lib/password.ts`:
  - `hashPassword(plain)` → bcrypt hash (rounds=12)
  - `verifyPassword(plain, hash)` → boolean

### 2.1.2 Token utilities
- `src/lib/tokens.ts`:
  - `signAccessToken(payload)` → JWT, expires 15min
  - `signRefreshToken(payload)` → JWT, expires 7d
  - `verifyAccessToken(token)` → JWTPayload | throws
  - `verifyRefreshToken(token)` → JWTPayload | throws
  - Использует `@ecomm/contracts` JWTPayloadSchema для валидации payload

### 2.1.3 Auth service
- `src/modules/auth/auth.service.ts`:
  - `register(input: RegisterInput)`:
    - Проверить уникальность email
    - Hash password
    - Создать user в DB
    - Вернуть token pair + PublicUser
  - `login(input: LoginInput)`:
    - Найти user по email
    - Verify password
    - Вернуть token pair + PublicUser
  - `refresh(refreshToken: string)`:
    - Verify refresh token
    - Проверить что token не в blacklist (Redis)
    - Вернуть новый token pair
  - `logout(refreshToken: string)`:
    - Добавить refresh token в Redis blacklist (TTL = remaining expiry)

### 2.1.4 Auth routes
- `src/modules/auth/auth.routes.ts`:
  - `POST /api/auth/register` — body validated via `RegisterInputSchema`
  - `POST /api/auth/login` — body validated via `LoginInputSchema`
  - `POST /api/auth/refresh` — читает refresh token из httpOnly cookie
  - `POST /api/auth/logout` — protected, invalidate refresh token
- Response: `{ data: { user: PublicUser, accessToken: string } }` + set httpOnly cookie для refresh

### 2.1.5 Auth middleware
- `src/middleware/authenticate.ts`:
  - preHandler hook
  - Читает `Authorization: Bearer <token>` header
  - Verify access token → декорирует `request.user` с JWTPayload
  - 401 если невалидный/expired
- `src/middleware/authorize.ts`:
  - `authorize(...roles: Role[])` — factory для preHandler
  - Проверяет `request.user.role` ∈ roles
  - 403 если нет доступа

### 2.1.6 Redis plugin
- `src/plugins/redis.ts`:
  - ioredis client plugin
  - Декорирует `fastify.redis`
  - Graceful disconnect on close

**Definition of Done**: Register → Login → получаем tokens → protected endpoint работает → refresh обновляет tokens → logout инвалидирует refresh.

---

## 2.2 Users Module

### 2.2.1 User service
- `src/modules/users/user.service.ts`:
  - `findById(id)` → PublicUser (без passwordHash)
  - `updateProfile(id, data)` — firstName, lastName
  - `findAll(params)` — admin only, paginated
  - `changePassword(id, oldPassword, newPassword)`

### 2.2.2 User routes
- `GET /api/users/me` — protected, текущий user
- `PUT /api/users/me` — protected, обновить профиль
- `PUT /api/users/me/password` — protected, сменить пароль
- `GET /api/users` — admin only, список пользователей
- `GET /api/users/:id` — admin only, детали пользователя

**Definition of Done**: Профиль доступен, обновление работает, admin видит список users.

---

## 2.3 Products Module (Full)

### 2.3.1 Расширить product.service.ts
- `findAll(params)` — добавить:
  - Фильтрация по `categoryId`, `status`, `search` (title ILIKE)
  - Сортировка по `price`, `title`, `createdAt`
  - `minPrice`, `maxPrice` range filter
- `create(data)` — валидация через `CreateProductSchema`, auto-generate slug
- `update(id, data)` — partial update через `UpdateProductSchema`
- `delete(id)` — soft delete (status → ARCHIVED) или hard delete

### 2.3.2 Slug generation
- `src/lib/slugify.ts`:
  - `generateSlug(title)` — transliterate + slugify
  - `ensureUniqueSlug(slug, prisma)` — append `-2`, `-3` if exists

### 2.3.3 Extended routes
- Добавить query params валидацию:
  ```
  GET /api/products?page=1&perPage=20&sort=price&direction=asc&categoryId=xxx&status=active&search=phone&minPrice=100&maxPrice=500
  ```
- POST/PUT/DELETE — protected, admin only

**Definition of Done**: Полный CRUD с фильтрацией, сортировкой, пагинацией. Slug автогенерация.

---

## 2.4 Categories Module (Full)

### 2.4.1 Расширить category.service.ts
- `findAll()` — tree structure (top-level с nested children)
- `findBySlug(slug)` — с products count и children
- `create(data)` — с parentId для вложенных категорий
- `update(id, data)`
- `delete(id)` — проверка что нет products, иначе 409

### 2.4.2 Routes
- `GET /api/categories` — дерево категорий
- `GET /api/categories/:slug` — детали + products count
- `GET /api/categories/:slug/products` — products в категории (paginated)
- POST/PUT/DELETE — admin only

**Definition of Done**: Древовидные категории работают, каскадная навигация category → products.

---

## 2.5 Orders Module

### 2.5.1 Order service
- `src/modules/orders/order.service.ts`:
  - `create(userId, input: CreateOrderInput)`:
    - Валидировать что все productId существуют и in stock
    - Посчитать totalAmount на сервере (не доверяем клиенту)
    - Уменьшить stock у products
    - Создать Order + OrderItems в транзакции
  - `findByUserId(userId, params)` — история заказов пользователя
  - `findById(id, userId?)` — деталь заказа (user видит только свои)
  - `updateStatus(id, status)` — admin only
  - `findAll(params)` — admin only, все заказы с фильтрацией по status

### 2.5.2 Order routes
- `POST /api/orders` — protected (customer), создать заказ
- `GET /api/orders` — protected:
  - Customer: свои заказы
  - Admin: все заказы (с фильтрацией)
- `GET /api/orders/:id` — protected (owner или admin)
- `PUT /api/orders/:id/status` — admin only

### 2.5.3 Order validation
- Проверка stock availability
- Проверка что product.status === ACTIVE
- Серверный расчёт цен (price берётся из DB, не из request)
- Prisma transaction для atomicity

**Definition of Done**: Checkout flow: создание заказа уменьшает stock, история заказов работает, admin меняет статусы.

---

## 2.6 S3 Upload Module

### 2.6.1 S3 Client
- `src/lib/s3.ts`:
  - `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
  - Config из env: endpoint, accessKey, secretKey, bucket
  - `getPresignedUploadUrl(key, contentType, maxSize)` → presigned PUT URL (expires 5min)
  - `deleteObject(key)`
  - `getPublicUrl(key)` — construct public URL

### 2.6.2 S3 Plugin
- `src/plugins/s3.ts`:
  - Декорирует `fastify.s3` с client и helpers
  - Проверяет bucket existence при старте, создаёт если нет

### 2.6.3 Upload service
- `src/modules/upload/upload.service.ts`:
  - `requestUpload(contentType, filename)`:
    - Генерирует unique key: `images/{year}/{month}/{uuid}.{ext}`
    - Возвращает `{ key, uploadUrl, publicUrl }`
  - Валидация: только image/* content types, max 5MB

### 2.6.4 Upload routes
- `POST /api/upload/presign` — protected
  - Body: `{ filename, contentType }`
  - Response: `{ key, uploadUrl }` (presigned PUT URL)
- `DELETE /api/upload/:key` — admin only

**Definition of Done**: Клиент получает presigned URL, загружает напрямую в MinIO, URL изображения сохраняется в product.images.

---

## 2.7 Generic Helpers

### 2.7.1 Pagination helper
- `src/lib/pagination.ts`:
  - `paginate(params: PaginationParams)` → `{ skip, take, orderBy }` для Prisma
  - `paginatedResponse(items, total, params)` → `PaginatedResponse<T>`

### 2.7.2 Validation plugin
- `src/plugins/zod-validation.ts`:
  - Интеграция `fastify-type-provider-zod`
  - Автоматическая валидация body/querystring/params через Zod schemas

---

## 2.8 Testing

### 2.8.1 Test setup
- `apps/backend/vitest.config.ts`
- `apps/backend/src/test/setup.ts`:
  - Test database (PostgreSQL, отдельная DB или schema)
  - Helper: `createTestApp()` — собирает Fastify с тестовым config
  - Helper: `createTestUser(role)` — создаёт user + возвращает auth headers
  - `beforeAll` / `afterAll` для DB cleanup

### 2.8.2 Module tests
- `src/modules/auth/auth.test.ts`:
  - Register → returns tokens
  - Login → returns tokens
  - Login wrong password → 401
  - Protected route without token → 401
  - Refresh token flow
- `src/modules/products/product.test.ts`:
  - List products → paginated
  - Get by slug → 200
  - Get non-existent → 404
  - Create (admin) → 201
  - Create (customer) → 403
  - Update → 200
  - Delete → 204
- `src/modules/orders/order.test.ts`:
  - Create order → reduces stock
  - Create with out-of-stock → 400
  - User sees only own orders

**Definition of Done**: `pnpm --filter backend test` — все тесты зелёные, coverage > 80% для services.

---

## 2.9 Verification Checklist

- [ ] Auth: register/login/refresh/logout — полный flow
- [ ] JWT: protected routes возвращают 401 без токена
- [ ] RBAC: admin-only routes возвращают 403 для customer
- [ ] Products: CRUD + фильтрация + сортировка + пагинация
- [ ] Categories: tree structure + nested products
- [ ] Orders: создание с транзакцией + stock уменьшается
- [ ] Upload: presigned URL генерируется, upload в MinIO работает
- [ ] Error handling: Prisma errors, Zod errors, 404, 500 — всё маппится в ApiErrorBody
- [ ] Tests: `pnpm --filter backend test` — all green
- [ ] Swagger: `/api/docs` показывает все endpoints
