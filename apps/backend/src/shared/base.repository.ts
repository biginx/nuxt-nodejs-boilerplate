export type BaseEntity = { id: string; createdAt: string }

export interface IBaseRepository<TEntity, TCreateDto, TUpdateDto> {
  findAll(): Promise<TEntity[]>
  findById(id: string): Promise<TEntity | null>
  create(dto: TCreateDto): Promise<TEntity>
  update(id: string, dto: TUpdateDto): Promise<TEntity | null>
  delete(id: string): Promise<boolean>
}

export abstract class BaseMockRepository<
  TEntity extends BaseEntity,
  TCreateDto,
  TUpdateDto
> implements IBaseRepository<TEntity, TCreateDto, TUpdateDto> {
  protected store: TEntity[]
  private nextId: number

  constructor(seed: TEntity[]) {
    this.store = structuredClone(seed)
    this.nextId = seed.length + 1
  }

  async findAll(): Promise<TEntity[]> {
    return [...this.store]
  }

  async findById(id: string): Promise<TEntity | null> {
    return this.store.find(item => item.id === id) ?? null
  }

  async create(dto: TCreateDto): Promise<TEntity> {
    const entity = {
      id: String(this.nextId++),
      ...(dto as Record<string, unknown>),
      createdAt: new Date().toISOString()
    } as TEntity
    this.store.push(entity)
    return entity
  }

  async update(id: string, dto: TUpdateDto): Promise<TEntity | null> {
    const index = this.store.findIndex(item => item.id === id)
    if (index === -1) return null
    this.store[index] = { ...this.store[index], ...dto }
    return this.store[index]
  }

  async delete(id: string): Promise<boolean> {
    const index = this.store.findIndex(item => item.id === id)
    if (index === -1) return false
    this.store.splice(index, 1)
    return true
  }
}
