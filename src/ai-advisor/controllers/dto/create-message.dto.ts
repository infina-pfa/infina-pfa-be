import { MessageSender, MessageType } from '@/ai-advisor/domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'How can I create a budget for this month?',
  })
  @IsString()
  @IsOptional()
  content?: string | null;

  @ApiProperty({
    description: 'Type of the message',
    example: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({
    description: 'Sender of the message',
    example: MessageSender.USER,
  })
  @IsEnum(MessageSender)
  sender: MessageSender;

  @ApiProperty({
    description: 'Optional metadata for the message',
    example: { timestamp: '2025-01-01T00:00:00Z' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
