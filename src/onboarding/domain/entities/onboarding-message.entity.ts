import { BaseEntity, BaseProps } from '@/common/base';
import { OptionalProps } from '@/common/utils';

export enum MessageSender {
  AI = 'ai',
  USER = 'user',
  SYSTEM = 'system',
}

export interface OnboardingMessageEntityProps extends BaseProps {
  userId: string;
  sender: MessageSender;
  content: string;
  componentId: string | null;
  metadata: Record<string, any> | null;
  deletedAt: Date | null;
}

export class OnboardingMessageEntity extends BaseEntity<OnboardingMessageEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<OnboardingMessageEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'componentId' | 'metadata' | 'deletedAt'
    >,
    id?: string,
  ): OnboardingMessageEntity {
    return new OnboardingMessageEntity(
      {
        ...props,
        componentId: props.componentId ?? null,
        metadata: props.metadata ?? null,
        deletedAt: props.deletedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }
    if (!this.props.content || this.props.content.trim().length === 0) {
      throw new Error('Content is required');
    }
    if (!Object.values(MessageSender).includes(this.props.sender)) {
      throw new Error('Invalid message sender');
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get sender(): MessageSender {
    return this.props.sender;
  }

  public get content(): string {
    return this.props.content;
  }

  public get componentId(): string | null {
    return this.props.componentId;
  }

  public get metadata(): Record<string, any> | null {
    return this.props.metadata;
  }

  public get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  public updateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    this._props.content = content.trim();
    this.updated();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this._props.metadata = metadata;
    this.updated();
  }

  public delete(): void {
    this._props.deletedAt = new Date();
    this.updated();
  }

  public isDeleted(): boolean {
    return !!this.props.deletedAt;
  }

  public isFromUser(): boolean {
    return this.props.sender === MessageSender.USER;
  }

  public isFromAI(): boolean {
    return this.props.sender === MessageSender.AI;
  }

  public isFromSystem(): boolean {
    return this.props.sender === MessageSender.SYSTEM;
  }
}
