import { BaseEntity, BaseProps } from '@/common/base/entities/base.entity';
import { OptionalProps } from '@/common/utils';

export enum MessageSender {
  AI = 'ai',
  USER = 'user',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  PHOTO = 'photo',
  COMPONENT = 'component',
  TOOL = 'tool',
}

export interface MessageEntityProps extends BaseProps {
  userId: string;
  conversationId: string;
  sender: MessageSender;
  type: MessageType;
  content: string;
  metadata?: Record<string, any>;
  deletedAt: Date | null;
}

export class MessageEntity extends BaseEntity<MessageEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<MessageEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'metadata' | 'deletedAt'
    >,
    id?: string,
  ): MessageEntity {
    return new MessageEntity(
      {
        ...props,
        deletedAt: props.deletedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        metadata: props.metadata ?? {},
      },
      id,
    );
  }

  public static createUserMessage(
    props: Omit<
      MessageEntityProps,
      | 'id'
      | 'sender'
      | 'type'
      | 'createdAt'
      | 'updatedAt'
      | 'metadata'
      | 'deletedAt'
    >,
    id?: string,
  ): MessageEntity {
    return this.create(
      { ...props, sender: MessageSender.USER, type: MessageType.TEXT },
      id,
    );
  }

  public static createAiMessage(
    props: Omit<
      MessageEntityProps,
      'id' | 'sender' | 'type' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): MessageEntity {
    return this.create(
      {
        ...props,
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        metadata: { ...props.metadata },
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.conversationId) {
      throw new Error('Conversation ID is required');
    }
    if (!this.props.sender) {
      throw new Error('Sender is required');
    }
    if (!this.props.type) {
      throw new Error('Type is required');
    }
    if (!this.props.content) {
      throw new Error('Content is required');
    }
  }

  public get conversationId(): string {
    return this.props.conversationId;
  }

  public get sender(): MessageSender {
    return this.props.sender;
  }

  public get type(): MessageType {
    return this.props.type;
  }

  public get content(): string {
    return this.props.content;
  }

  public get metadata(): Record<string, any> {
    return this.props.metadata || {};
  }
}
