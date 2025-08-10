import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StreamMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'How can I create a budget for this month?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
