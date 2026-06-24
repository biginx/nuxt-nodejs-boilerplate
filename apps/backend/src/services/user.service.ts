import type { IUserRepository } from '@/repositories/user.repository.js'
import type { User, CreateUserDto, UpdateUserDto } from '@/models/user.model.js'
import { BaseService } from '@/shared/base.service.js'

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto, IUserRepository> {
  constructor(repo: IUserRepository) {
    super(repo)
  }

  override async create(dto: CreateUserDto): Promise<{ data?: User; error?: string }> {
    const existing = await this.repo.findByEmail(dto.email)
    if (existing) return { error: 'Email already in use' }
    return super.create(dto)
  }
}
