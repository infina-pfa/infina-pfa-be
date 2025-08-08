import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StreamOnboardingMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, I need help setting up my budget.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
