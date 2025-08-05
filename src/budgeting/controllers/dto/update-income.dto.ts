import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class UpdateIncomeDto {
  @ApiProperty({
    description: 'Name of the income',
    example: 'Salary',
    minimum: 0.01,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Income amount',
    example: 500,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'Income amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Recurring frequency in days (0 for one-time)',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Recurring frequency must be greater than 0' })
  recurring: number;

  @ApiProperty({
    description: 'User ID who owns this income',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}
