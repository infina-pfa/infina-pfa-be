import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { OnboardingMessageSender } from '../../domain';

export class CreateOnboardingMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, I need help setting up my budget.',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Sender of the message',
    example: OnboardingMessageSender.USER,
  })
  @IsEnum(OnboardingMessageSender)
  @IsNotEmpty()
  sender: OnboardingMessageSender;

  @ApiProperty({
    description: 'Component ID',
    example: '123',
    required: false,
  })
  @IsString()
  @IsOptional()
  component_id?: string;

  @ApiProperty({
    description: 'Metadata',
    example: { key: 'value' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
