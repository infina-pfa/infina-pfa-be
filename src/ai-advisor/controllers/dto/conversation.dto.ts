import { ConversationEntity } from '@/ai-advisor/domain/entities/conversation.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationDto {
  @ApiProperty({
    description: 'Unique identifier of the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the conversation',
    example: 'Budget Planning Discussion',
  })
  name: string;

  @ApiProperty({
    description: 'User ID who owns this conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'When the conversation was created',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the conversation was last updated',
    example: '2025-01-01T00:00:00Z',
  })
  updatedAt: Date;

  public static fromEntity(entity: ConversationEntity): ConversationDto {
    return {
      id: entity.id,
      name: entity.name,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
