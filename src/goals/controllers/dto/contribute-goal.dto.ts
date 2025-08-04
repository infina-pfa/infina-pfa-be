import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ContributeGoalDto {
  @ApiProperty({
    description: 'Amount to contribute to the goal',
    example: 1000,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiProperty({
    description: 'Name of the contribution transaction',
    example: 'Monthly savings',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the contribution',
    example: 'Monthly contribution to house down payment goal',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Recurring interval in days (0 for one-time)',
    example: 30,
    required: false,
    default: 0,
  })
  @IsNumber({}, { message: 'Recurring must be a number' })
  @Min(0, { message: 'Recurring must be 0 or greater' })
  @IsOptional()
  recurring?: number = 0;
}
