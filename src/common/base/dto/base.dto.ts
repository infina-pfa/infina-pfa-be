import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'The ID of the user',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
