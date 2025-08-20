import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PayDebtDto {
  @ApiProperty({
    description: 'Payment amount',
    example: 500,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Payment name',
    example: 'Monthly payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Regular monthly payment for mortgage',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
