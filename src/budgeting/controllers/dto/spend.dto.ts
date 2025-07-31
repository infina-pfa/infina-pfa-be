import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SpendDto {
  @ApiProperty({
    description: 'Amount to spend',
    example: 50,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Spend amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Name of the spending',
    example: 'Grocery shopping',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the spending',
    example: 'Weekly grocery shopping at Walmart',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Recurring frequency in days (0 for one-time)',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  recurring?: number;
}
