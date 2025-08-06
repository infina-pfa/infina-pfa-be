import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Title of the conversation',
    example: 'Budget Planning Discussion',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
