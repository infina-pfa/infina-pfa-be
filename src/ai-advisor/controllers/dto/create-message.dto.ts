import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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

export class CreateMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'How can I create a budget for this month?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Optional metadata for the message',
    example: { timestamp: '2025-01-01T00:00:00Z' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
