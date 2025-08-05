import { ApiProperty } from '@nestjs/swagger';
import { MessageSender, OnboardingMessageEntity } from '@/onboarding/domain';

export class OnboardingMessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Who sent the message',
    enum: MessageSender,
    example: MessageSender.USER,
  })
  sender: MessageSender;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, I need help setting up my budget.',
  })
  content: string;

  @ApiProperty({
    description: 'Component ID for UI rendering',
    example: 'budget-setup-component',
    nullable: true,
  })
  componentId: string | null;

  @ApiProperty({
    description: 'Additional metadata',
    example: { messageType: 'initial_question', context: 'budget_setup' },
    nullable: true,
  })
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2025-08-05T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Message last update timestamp',
    example: '2025-08-05T10:30:00Z',
  })
  updatedAt: Date;

  static fromEntity(
    entity: OnboardingMessageEntity,
  ): OnboardingMessageResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      sender: entity.sender,
      content: entity.content,
      componentId: entity.componentId,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
