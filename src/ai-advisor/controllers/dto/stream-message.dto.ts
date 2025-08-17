import { MessageSender } from '@/ai-advisor/domain';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class StreamMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'How can I create a budget for this month?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Sender of the message',
    example: MessageSender.USER,
  })
  @IsEnum(MessageSender)
  @IsNotEmpty()
  sender: MessageSender;

  @ApiProperty({
    description: 'Image URLs',
    example: ['https://example.com/image.jpg'],
  })
  @IsArray()
  @IsOptional()
  imageUrls?: string[];
}
