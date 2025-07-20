import { BaseEntity, BaseProps } from '../entities/base.entity';
import { FindManyOptions } from '../types/query.types';

export abstract class BaseRepository<E extends BaseEntity<BaseProps>> {
  abstract create(entity: E): Promise<E>;

  abstract update(entity: E): Promise<E>;

  abstract delete(entity: E): Promise<void>;

  abstract findById(id: string): Promise<E | null>;

  abstract createMany(entities: E[]): Promise<E[]>;

  abstract findMany(
    props: Partial<E['props']>,
    options?: FindManyOptions,
  ): Promise<E[]>;
}
