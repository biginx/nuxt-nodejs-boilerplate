import { BaseMockRepository } from '@/shared/base.repository.js'
import type { IUserRepository } from '@/repositories/user.repository.js'
import type { User, CreateUserDto, UpdateUserDto } from '@/models/user.model.js'
import { mockUsers } from '@/data/users.mock.js'

export class MockUserRepository
  extends BaseMockRepository<User, CreateUserDto, UpdateUserDto>
  implements IUserRepository
{
  constructor() {
    super(mockUsers)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.find(u => u.email === email) ?? null
  }
}
