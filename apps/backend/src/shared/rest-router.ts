import { Router, type RequestHandler, type IRouter } from 'express'

export interface IRestController {
  getAll: RequestHandler
  getById: RequestHandler
  create: RequestHandler
  update: RequestHandler
  delete: RequestHandler
}

export interface RouteDefinition {
  resource: string
  router: IRouter
}

export function createRestRouter(controller: IRestController): IRouter {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.post('/', controller.create)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)
  return router
}
