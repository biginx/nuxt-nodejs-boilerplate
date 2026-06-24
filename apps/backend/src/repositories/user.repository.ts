import type { IBaseRepository } from '@/shared/base.repository.js'
import type { User, CreateUserDto, UpdateUserDto } from '@/models/user.model.js'

export interface IUserRepository extends IBaseRepository<User, CreateUserDto, UpdateUserDto> {
  findByEmail(email: string): Promise<User | null>
}
