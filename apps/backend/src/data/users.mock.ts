import type { User } from '../models/user.model.js'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Nguyen',
    email: 'alice@example.com',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Bob Tran',
    email: 'bob@example.com',
    createdAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Charlie Le',
    email: 'charlie@example.com',
    createdAt: '2024-01-03T00:00:00.000Z'
  }
]
