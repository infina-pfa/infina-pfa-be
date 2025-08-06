import { BaseEntity, BaseProps } from '@/common/base/entities/base.entity';
import { OptionalProps } from '@/common/utils';

export interface ConversationEntityProps extends BaseProps {
  userId: string;
  name: string;
  deletedAt: Date | null;
}

export class ConversationEntity extends BaseEntity<ConversationEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<ConversationEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): ConversationEntity {
    return new ConversationEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Title is required');
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get name(): string {
    return this.props.name;
  }

  public updateName(name: string): void {
    this.update({ name });
  }
}
