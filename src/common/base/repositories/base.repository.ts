import { FindManyOptions } from '../../types/query.types';
import { BaseEntity, BaseProps } from '../entities/base.entity';

export abstract class BaseRepository<E extends BaseEntity<BaseProps>> {
  abstract toEntity(data: unknown): E;

  abstract toORM(entity: E): unknown;

  abstract create(entity: E): Promise<E>;

  abstract update(entity: E): Promise<E>;

  abstract delete(entity: E): Promise<void>;

  abstract findById(id: string): Promise<E | null>;

  abstract findOne(
    props: Partial<E['props']> & { id?: string },
  ): Promise<E | null>;

  abstract createMany(entities: E[]): Promise<number>;

  abstract findMany(
    props: Partial<E['props']>,
    options?: FindManyOptions,
  ): Promise<E[]>;
}
