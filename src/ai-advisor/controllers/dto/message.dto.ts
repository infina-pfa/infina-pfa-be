import { ApiProperty } from '@nestjs/swagger';
import { MessageSender, MessageType } from './create-message.dto';
import { MessageEntity } from '@/ai-advisor/domain/entities/message.entity';

export class MessageDto {
  @ApiProperty({
    description: 'Unique identifier of the message',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the conversation this message belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  conversationId: string;

  @ApiProperty({
    description: 'Who sent the message',
    enum: MessageSender,
    example: MessageSender.USER,
  })
  sender: MessageSender;

  @ApiProperty({
    description: 'Type of the message',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty({
    description: 'Content of the message',
    example: 'How can I create a budget for this month?',
  })
  content: string;

  @ApiProperty({
    description: 'Optional metadata for the message',
    example: { timestamp: '2025-01-01T00:00:00Z' },
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'When the message was created',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the message was last updated',
    example: '2025-01-01T00:00:00Z',
  })
  updatedAt: Date;

  public static fromEntity(entity: MessageEntity): MessageDto {
    return {
      id: entity.id,
      conversationId: entity.conversationId,
      sender: entity.sender,
      type: entity.type,
      content: entity.content,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
