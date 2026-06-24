# Sample NodeJS Structure

A reference monorepo that demonstrates the team's standard full-stack architecture.
Clone it, read it, and use it as the starting point for new projects.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Nuxt v4 (SSR), Nuxt UI v3, Tailwind CSS v4 |
| State | Pinia + Pinia Colada (`useQuery` / `useMutation`) |
| Utilities | VueUse, Zod (frontend validation) |
| Backend | Express v5, TypeScript (strict, NodeNext) |
| Validation | Zod |
| Package manager | pnpm workspaces |
| Testing | Vitest (both apps) |

## Project structure

```
sample-nodejs-structure/
├── apps/
│   ├── frontend/          # Nuxt v4 SSR app  (port 3000)
│   │   └── app/
│   │       ├── assets/css/    # Global styles, Lato font, Tailwind theme
│   │       ├── components/    # Auto-imported Vue components
│   │       ├── composables/   # Auto-imported composables
│   │       ├── layouts/       # Page layouts
│   │       ├── pages/         # File-based routing
│   │       └── stores/        # Pinia stores
│   │
│   └── backend/           # Express v5 API  (port 3001)
│       └── src/
│           ├── shared/        # Generic base classes (see below)
│           ├── models/        # TypeScript interfaces per resource
│           ├── data/          # In-memory mock seed data
│           ├── repositories/  # Data access layer
│           ├── services/      # Business logic layer
│           ├── controllers/   # HTTP layer
│           └── routes/        # Route wiring + auto-registration
│
├── package.json           # Workspace root scripts
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 9+ — `npm install -g pnpm`

## Getting started

```bash
# 1. Install all dependencies
pnpm install

# 2. Copy environment files
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env

# 3. Start both apps
pnpm dev:frontend   # http://localhost:3000
pnpm dev:backend    # http://localhost:3001
```

## Available scripts

Run from the repo root:

```bash
pnpm dev:frontend      # Nuxt dev server with HMR
pnpm dev:backend       # Express with tsx watch (auto-reload)

pnpm build:frontend    # Production Nuxt build
pnpm build:backend     # tsc + tsc-alias → dist/

pnpm typecheck         # Type-check both apps
pnpm lint              # ESLint both apps
pnpm test              # Vitest (run once) for both apps
```

Or run per-app from `apps/frontend/` or `apps/backend/`:

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Backend architecture

The backend uses a layered **Repository pattern** with generic abstract base classes.
Every resource (User, Product, …) follows the same shape — only domain-specific
logic is added per resource; nothing is duplicated.

```
Request → routes/ → controllers/ → services/ → repositories/ → data/
```

### Shared base classes (`src/shared/`)

| File | What it does |
|---|---|
| `base.repository.ts` | `BaseMockRepository<T,C,U>` — full CRUD against an in-memory array |
| `base.service.ts` | `BaseService<T,C,U>` — delegates all CRUD to the repo; override `create` for business rules |
| `base.controller.ts` | `BaseController<T,C,U>` — all 5 HTTP handlers with error handling; define Zod schemas + `resourceName` |
| `rest-router.ts` | `createRestRouter(controller)` — wires `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| `api-response.ts` | `ApiResponse` static class — all HTTP responses in one place (`ok`, `created`, `notFound`, …) |

### Auto-route registration

`app.ts` never needs to change when you add a new resource.
Routes register themselves by declaring a `resource` name:

```
routes/index.ts  ← only file to edit when adding a resource
     ↓ registerRoutes(app)
app.ts           ← never touched
```

## How to add a new resource

Follow these steps to add, for example, **Product** (`/api/products`).

### 1 — Model (`src/models/product.model.ts`)

```ts
export interface Product {
  id: string
  name: string
  price: number
  createdAt: string
}

export interface CreateProductDto {
  name: string
  price: number
}

export interface UpdateProductDto {
  name?: string
  price?: number
}
```

### 2 — Mock data (`src/data/products.mock.ts`)

```ts
import type { Product } from '@/models/product.model.js'

export const mockProducts: Product[] = [
  { id: '1', name: 'Widget', price: 9.99, createdAt: '2024-01-01T00:00:00.000Z' },
]
```

### 3 — Repository interface (`src/repositories/product.repository.ts`)

```ts
import type { IBaseRepository } from '@/shared/base.repository.js'
import type { Product, CreateProductDto, UpdateProductDto } from '@/models/product.model.js'

export interface IProductRepository
  extends IBaseRepository<Product, CreateProductDto, UpdateProductDto> {
  // add domain-specific lookups here, e.g.:
  // findByName(name: string): Promise<Product | null>
}
```

### 4 — Mock repository (`src/repositories/product.mock.repository.ts`)

```ts
import { BaseMockRepository } from '@/shared/base.repository.js'
import type { IProductRepository } from '@/repositories/product.repository.js'
import type { Product, CreateProductDto, UpdateProductDto } from '@/models/product.model.js'
import { mockProducts } from '@/data/products.mock.js'

export class MockProductRepository
  extends BaseMockRepository<Product, CreateProductDto, UpdateProductDto>
  implements IProductRepository
{
  constructor() {
    super(mockProducts)
  }
}
```

### 5 — Service (`src/services/product.service.ts`)

```ts
import { BaseService } from '@/shared/base.service.js'
import type { IProductRepository } from '@/repositories/product.repository.js'
import type { Product, CreateProductDto, UpdateProductDto } from '@/models/product.model.js'

export class ProductService extends BaseService<
  Product, CreateProductDto, UpdateProductDto, IProductRepository
> {
  constructor(repo: IProductRepository) {
    super(repo)
  }

  // Only override create (or other methods) when you have business rules.
}
```

### 6 — Controller (`src/controllers/product.controller.ts`)

```ts
import { z } from 'zod'
import { BaseController } from '@/shared/base.controller.js'
import type { ProductService } from '@/services/product.service.js'
import type { Product, CreateProductDto, UpdateProductDto } from '@/models/product.model.js'

export class ProductController extends BaseController<Product, CreateProductDto, UpdateProductDto> {
  protected readonly resourceName = 'Product'
  protected readonly createSchema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
  })
  protected readonly updateSchema = z.object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
  })

  constructor(service: ProductService) {
    super(service)
  }
}
```

### 7 — Route module (`src/routes/product.routes.ts`)

```ts
import { MockProductRepository } from '@/repositories/product.mock.repository.js'
import { ProductService } from '@/services/product.service.js'
import { ProductController } from '@/controllers/product.controller.js'
import { createRestRouter } from '@/shared/rest-router.js'

const repo = new MockProductRepository()
const service = new ProductService(repo)
const controller = new ProductController(service)

export default {
  resource: 'products',
  router: createRestRouter(controller),
}
```

### 8 — Register the route (`src/routes/index.ts`)

```ts
// Add this import:
import productsRoute from '@/routes/product.routes.js'

const routes: RouteDefinition[] = [
  usersRoute,
  productsRoute,  // ← add this line
]
```

That's it. `GET /api/products`, `POST /api/products`, `GET /api/products/:id`,
`PATCH /api/products/:id`, and `DELETE /api/products/:id` are now live.
`app.ts` is untouched.

## Environment variables

**`apps/frontend/.env`**
```
NUXT_PUBLIC_API_URL=http://localhost:3001
```

**`apps/backend/.env`**
```
PORT=3001
```

## API reference

Base URL: `http://localhost:3001`

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get a user |
| `POST` | `/api/users` | Create a user |
| `PATCH` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

All responses follow this shape:
```json
{ "data": { ... } }           // 200 / 201
{ "error": "...", "details": { ... } }  // 400 / 404 / 409 / 500
```
