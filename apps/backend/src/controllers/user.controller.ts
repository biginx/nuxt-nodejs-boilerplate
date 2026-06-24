import { z } from 'zod'
import type { UserService } from '@/services/user.service.js'
import type { User, CreateUserDto, UpdateUserDto } from '@/models/user.model.js'
import { BaseController } from '@/shared/base.controller.js'

export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  protected readonly createSchema = z.object({
    name: z.string().min(1),
    email: z.string().email()
  })

  protected readonly updateSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional()
  })

  protected readonly resourceName = 'User'

  constructor(service: UserService) {
    super(service)
  }
}
