import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class WithdrawGoalDto {
  @ApiProperty({
    description: 'Amount to withdraw from the goal',
    example: 500,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiProperty({
    description: 'Name of the withdrawal transaction',
    example: 'Emergency expense',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the withdrawal',
    example: 'Emergency medical expense from house fund',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Recurring interval in days (0 for one-time)',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber({}, { message: 'Recurring must be a number' })
  @Min(0, { message: 'Recurring must be 0 or greater' })
  @IsOptional()
  recurring?: number = 0;
}
