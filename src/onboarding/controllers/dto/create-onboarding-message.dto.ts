import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';
import { MessageSender } from '@/onboarding/domain';

export class CreateOnboardingMessageDto {
  @ApiProperty({
    description: 'Who sent the message',
    enum: MessageSender,
    example: MessageSender.USER,
  })
  @IsEnum(MessageSender)
  sender: MessageSender;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, I need help setting up my budget.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Component ID for UI rendering (optional)',
    example: 'budget-setup-component',
    required: false,
  })
  @IsOptional()
  @IsString()
  componentId?: string;

  @ApiProperty({
    description: 'Additional metadata for the message',
    example: { messageType: 'initial_question', context: 'budget_setup' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
