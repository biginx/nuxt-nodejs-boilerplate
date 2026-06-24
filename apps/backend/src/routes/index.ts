import type { Express } from 'express'
import type { RouteDefinition } from '@/shared/rest-router.js'

import usersRoute from '@/routes/user.routes.js'
// To add a new resource, import it here and add it to the array below:
// import productsRoute from '@/routes/product.routes.js'

const routes: RouteDefinition[] = [
  usersRoute,
  // productsRoute,
]

export function registerRoutes(app: Express): void {
  for (const { resource, router } of routes) {
    app.use(`/api/${resource}`, router)
  }
}
