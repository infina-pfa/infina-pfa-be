import { BaseEntity, BaseProps } from '../entities/base.entity';

export abstract class BaseRepository<E extends BaseEntity<BaseProps>> {
  abstract create(entity: E): Promise<E>;

  abstract update(entity: E): Promise<E>;

  abstract delete(entity: E): Promise<void>;

  abstract findById(id: string): Promise<E | null>;

  abstract upsert(entity: E): Promise<E>;

  abstract createMany(entities: E[]): Promise<E[]>;

  abstract findByIdAndUserId(id: string, userId: string): Promise<E | null>;
}
