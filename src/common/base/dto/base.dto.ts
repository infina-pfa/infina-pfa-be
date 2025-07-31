import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'The ID of the user',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
