import { BaseEntity, BaseProps } from '@/common';
import { PrismaDelegate } from '../types/prisma';
import { FindManyOptions } from '../types/query.types';
import { camelCaseToSnakeCase } from '../utils/object';
import { BaseRepository } from './base.repository';

export abstract class PrismaRepository<E extends BaseEntity<BaseProps>>
  implements BaseRepository<E>
{
  constructor(protected readonly prisma: PrismaDelegate<unknown>) {}

  public abstract toORM(entity: E): unknown;

  public abstract toEntity(data: unknown): E;

  public async create(entity: E): Promise<E> {
    await this.prisma.create({
      data: this.toORM(entity),
    });

    return entity;
  }

  public async update(entity: E): Promise<E> {
    await this.prisma.update({
      where: { id: entity.id },
      data: this.toORM(entity),
    });
    return entity;
  }

  public async delete(entity: E): Promise<void> {
    await this.prisma.delete({
      where: { id: entity.id },
    });
  }

  public async findById(id: string): Promise<E | null> {
    const budget = await this.prisma.findUnique({
      where: { id },
    });
    return budget ? this.toEntity(budget) : null;
  }

  public async findOne(props: Partial<E['props']>): Promise<E | null> {
    const budget = await this.prisma.findFirst({
      where: camelCaseToSnakeCase(props),
    });
    return budget ? this.toEntity(budget) : null;
  }

  public async findMany(
    props: Partial<E['props']>,
    options?: FindManyOptions,
  ): Promise<E[]> {
    const budgets = await this.prisma.findMany({
      where: camelCaseToSnakeCase(props),
      skip:
        (options?.pagination?.page ?? 0) * (options?.pagination?.limit ?? 10),
      take: options?.pagination?.limit,
      orderBy: options?.sort?.map((sort) => ({
        [sort.field]: sort.direction,
      })),
    });
    return budgets.map((budget) => this.toEntity(budget));
  }

  public async createMany(entities: E[]): Promise<number> {
    await this.prisma.createMany({
      data: entities.map((entity) => this.toORM(entity)),
    });
    return entities.length;
  }
}
