import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Title of the goal',
    example: 'Buy a house',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the goal',
    example: 'Save for a down payment on a house in the suburbs',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Target amount to achieve the goal (in the default currency)',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetAmount?: number;

  @ApiProperty({
    description: 'Due date for the goal',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
