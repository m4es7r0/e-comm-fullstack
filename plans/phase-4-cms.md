# Phase 4: CMS — React SPA Admin Panel (Week 8–9)

Цель: admin panel для управления магазином — CRUD товаров, категорий, заказов, пользователей, загрузка изображений, dashboard.

**Prerequisites**: Phase 2 (backend) завершена. Phase 3 (frontend) желательно завершена, но не блокирует.

---

## 4.1 Vite + React Scaffold

### 4.1.1 Инициализация
- `apps/cms/` — Vite + React + TypeScript
- Dependencies: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`, `tailwindcss`
- `@ecomm/qore` и `@ecomm/contracts` как workspace dependencies
- Tailwind CSS config

### 4.1.2 FSD структура
- Та же структура что и frontend:
  ```
  src/app/       → providers, router, layouts
  src/pages/
  src/widgets/
  src/features/
  src/entities/
  src/shared/
  ```
- Path aliases

### 4.1.3 App layer
- `src/app/index.tsx` — entry point
- `src/app/router.tsx` — React Router с lazy loading
- `src/app/providers/query-provider.tsx`
- `src/app/providers/auth-provider.tsx`
- `src/app/layouts/dashboard-layout.tsx`:
  - Sidebar navigation
  - Top bar с user menu
  - Main content area
- `src/app/layouts/auth-layout.tsx`:
  - Centered card layout для login

**Definition of Done**: CMS запускается, routing работает, dashboard layout рендерится.

---

## 4.2 Shared Layer (CMS-specific)

### 4.2.1 API Client
- `src/shared/api/client.ts`:
  - `createApiClient({ prefixUrl: env.VITE_API_URL })`
  - Auth middleware (admin JWT)
  - Same qore patterns as frontend

### 4.2.2 Admin UI Kit
- Переиспользуем базовые компоненты (Button, Input, Modal, Badge)
- Дополнительные admin-специфичные:
  - `DataTable` — generic table с sort, filter, pagination, row selection
  - `FormField` — label + input + error wrapper
  - `PageHeader` — title + actions (Create button, etc.)
  - `StatsCard` — число + label + trend
  - `ConfirmDialog` — подтверждение удаления
  - `ImageUpload` — drag & drop + preview + S3 presigned upload
  - `Sidebar` — navigation component
  - `Breadcrumb`

### 4.2.3 Generic hooks
- `useDataTable(queryOptions, columns)` — hook для table state (sort, filter, page, selection)
- `useEntityForm(schema, defaultValues, onSubmit)` — hook для CRUD форм
- `useImageUpload()` — hook для S3 presigned upload flow
- `useConfirmDialog()` — hook для confirm/cancel dialogs

**Definition of Done**: Admin UI kit готов, generic hooks работают.

---

## 4.3 Entity Layer (CMS versions)

### 4.3.1 Product entity (admin)
- `entities/product/api/` — те же actions/queries что и frontend (через qore)
- `entities/product/lib/adapter.ts`:
  - `adaptProductToTableRow(product)` → UIContract для DataTable
  - `adaptProductToFormValues(product)` → FormContract для edit form
- `entities/product/ui/product-table-row.tsx`
- `entities/product/ui/product-status-badge.tsx`
- `entities/product/index.ts`

### 4.3.2 Category entity (admin)
- `entities/category/api/`
- `entities/category/lib/adapter.ts` — adaptCategoryToTableRow, adaptCategoryToFormValues
- `entities/category/ui/category-table-row.tsx`
- `entities/category/ui/category-tree-select.tsx` — select с tree structure для parentId
- `entities/category/index.ts`

### 4.3.3 Order entity (admin)
- `entities/order/api/`
- `entities/order/lib/adapter.ts` — adaptOrderToTableRow, adaptOrderToDetail
- `entities/order/ui/order-table-row.tsx`
- `entities/order/ui/order-status-select.tsx` — select для смены статуса
- `entities/order/index.ts`

### 4.3.4 User entity (admin)
- `entities/user/api/`
- `entities/user/lib/adapter.ts`
- `entities/user/ui/user-table-row.tsx`
- `entities/user/index.ts`

**Definition of Done**: Все entity adapters готовы для table и form views.

---

## 4.4 Features Layer (CMS)

### 4.4.1 Auth feature (admin login)
- `features/auth/model/use-admin-login.ts`:
  - Login form + role check (reject if not ADMIN)
- `features/auth/ui/admin-login-form.tsx`
- `features/auth/model/admin-auth-store.ts` — zustand: admin user + token
- `features/auth/index.ts`

### 4.4.2 Manage Products feature
- `features/manage-products/model/use-create-product.ts`:
  - Form state + mutation + cache strategy (invalidate list)
- `features/manage-products/model/use-update-product.ts`:
  - Edit form + mutation + optimistic update
- `features/manage-products/model/use-delete-product.ts`:
  - Confirm dialog + mutation + invalidate
- `features/manage-products/ui/product-form.tsx`:
  - Title, slug (auto-generate), description (textarea)
  - Price, compareAtPrice, currency
  - Category select (tree)
  - Status select
  - Stock number input
  - Images upload (multiple, drag & drop, reorder)
  - Attributes (dynamic key-value pairs)
- `features/manage-products/index.ts`

### 4.4.3 Manage Categories feature
- `features/manage-categories/model/use-create-category.ts`
- `features/manage-categories/model/use-update-category.ts`
- `features/manage-categories/model/use-delete-category.ts`
- `features/manage-categories/ui/category-form.tsx`:
  - Name, slug, description, parentId (tree select)
- `features/manage-categories/index.ts`

### 4.4.4 Manage Orders feature
- `features/manage-orders/model/use-update-order-status.ts`
- `features/manage-orders/ui/order-status-form.tsx`
- `features/manage-orders/index.ts`

### 4.4.5 Manage Users feature
- `features/manage-users/` — view-only (list + detail), no create/edit для v1
- `features/manage-users/index.ts`

### 4.4.6 Upload Images feature
- `features/upload-images/model/use-image-upload.ts`:
  - Request presigned URL → upload to MinIO → return public URL
  - Progress tracking
  - Multiple files support
- `features/upload-images/ui/image-uploader.tsx`:
  - Drag & drop zone
  - Preview thumbnails
  - Upload progress bar
  - Remove uploaded image
- `features/upload-images/index.ts`

**Definition of Done**: Все CRUD операции работают через features с proper cache invalidation.

---

## 4.5 Widgets Layer (CMS)

### 4.5.1 Sidebar widget
- `widgets/sidebar/ui/sidebar.tsx`:
  - Navigation links: Dashboard, Products, Categories, Orders, Users
  - Active state
  - Collapse/expand

### 4.5.2 Products Table widget
- `widgets/products-table/ui/products-table.tsx`:
  - DataTable с columns: image, title, price, status, stock, category, actions
  - Filters: status, category
  - Sort: title, price, createdAt
  - Row actions: edit, delete
  - Bulk actions: delete selected, change status
- `widgets/products-table/index.ts`

### 4.5.3 Categories Table widget
- `widgets/categories-table/ui/categories-table.tsx`:
  - Columns: name, slug, parent, products count, actions
- `widgets/categories-table/index.ts`

### 4.5.4 Orders Table widget
- `widgets/orders-table/ui/orders-table.tsx`:
  - Columns: order #, customer, items count, total, status, date, actions
  - Filters: status, date range
- `widgets/orders-table/index.ts`

### 4.5.5 Users Table widget
- `widgets/users-table/ui/users-table.tsx`:
  - Columns: name, email, role, orders count, registered date
- `widgets/users-table/index.ts`

### 4.5.6 Dashboard Stats widget
- `widgets/dashboard-stats/ui/dashboard-stats.tsx`:
  - Total revenue, total orders, total products, total users
  - StatsCards в grid
  - Период: today, week, month
- `widgets/dashboard-stats/index.ts`

**Definition of Done**: Все виджеты собирают entity + feature components, DataTable generic и переиспользуем.

---

## 4.6 Pages Layer (CMS)

### 4.6.1 Login page
- `src/pages/auth/login/ui/login-page.tsx` — AdminLoginForm in AuthLayout
- Route: `/login`

### 4.6.2 Dashboard page
- `src/pages/dashboard/ui/dashboard-page.tsx` — DashboardStats widget
- Route: `/` (protected)

### 4.6.3 Products pages
- `src/pages/products/list/ui/products-list-page.tsx` — ProductsTable + "Create" button
- `src/pages/products/create/ui/product-create-page.tsx` — ProductForm (create mode)
- `src/pages/products/edit/ui/product-edit-page.tsx` — ProductForm (edit mode, prefilled)
- Routes: `/products`, `/products/create`, `/products/:id/edit`

### 4.6.4 Categories pages
- `src/pages/categories/list/ui/categories-list-page.tsx`
- `src/pages/categories/create/ui/category-create-page.tsx`
- `src/pages/categories/edit/ui/category-edit-page.tsx`
- Routes: `/categories`, `/categories/create`, `/categories/:id/edit`

### 4.6.5 Orders pages
- `src/pages/orders/list/ui/orders-list-page.tsx` — OrdersTable
- `src/pages/orders/detail/ui/order-detail-page.tsx` — order info + items + status change
- Routes: `/orders`, `/orders/:id`

### 4.6.6 Users page
- `src/pages/users/list/ui/users-list-page.tsx` — UsersTable
- Route: `/users`

### 4.6.7 Router config
- `src/app/router.tsx`:
  - Public: `/login`
  - Protected (DashboardLayout): all other routes
  - Lazy loading для всех pages
  - 404 page

**Definition of Done**: Все CMS страницы доступны, CRUD работает, navigation по sidebar.

---

## 4.7 Verification Checklist

- [ ] Admin login works (rejects non-admin users)
- [ ] Dashboard: stats cards показывают реальные данные
- [ ] Products: list → create → edit → delete — полный CRUD
- [ ] Products: image upload via S3 presigned URLs
- [ ] Products: slug auto-generation
- [ ] Categories: list → create → edit → delete, tree select для parent
- [ ] Orders: list с фильтрами, detail view, status change
- [ ] Users: list view
- [ ] DataTable: sort, filter, pagination работают generic
- [ ] Cache: invalidation после мутаций (list обновляется после create/update/delete)
- [ ] Auth: token refresh, redirect to login on 401
- [ ] FSD: правила импортов соблюдены
- [ ] Responsive: sidebar collapse на мобильных
