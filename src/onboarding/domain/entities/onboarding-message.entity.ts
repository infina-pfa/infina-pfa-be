import { BaseEntity, BaseProps } from '@/common/base';
import { OptionalProps } from '@/common/utils';
import { OnboardingErrorFactory } from '../errors';

export enum OnboardingMessageSender {
  AI = 'ai',
  USER = 'user',
  SYSTEM = 'system',
}

export interface OnboardingMessageEntityProps extends BaseProps {
  userId: string;
  sender: OnboardingMessageSender;
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
    if (!Object.values(OnboardingMessageSender).includes(this.props.sender)) {
      throw OnboardingErrorFactory.messageInvalidSender();
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get sender(): OnboardingMessageSender {
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
    return this.props.sender === OnboardingMessageSender.USER;
  }

  public isFromAI(): boolean {
    return this.props.sender === OnboardingMessageSender.AI;
  }

  public isFromSystem(): boolean {
    return this.props.sender === OnboardingMessageSender.SYSTEM;
  }
}
