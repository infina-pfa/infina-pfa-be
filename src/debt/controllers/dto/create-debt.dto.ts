import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DebtType } from '@/debt/domain';

export class CreateDebtDto {
  @ApiProperty({
    description: 'Name of the lender',
    example: 'Bank of America',
  })
  @IsString()
  @IsNotEmpty()
  lender: string;

  @ApiProperty({
    description: 'Purpose of the debt',
    example: 'Home mortgage',
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: 'Interest rate (as percentage)',
    example: 5.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Interest rate must be non-negative' })
  rate: number;

  @ApiProperty({
    description: 'Due date for the debt',
    example: '2025-12-31T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({
    description: 'Total debt amount',
    example: 10000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Debt amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Initial paid amount',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Paid amount must be non-negative' })
  currentPaidAmount?: number;

  @ApiProperty({
    description: 'Debt type',
    enum: DebtType,
    example: DebtType.BAD_DEBT,
  })
  @IsEnum(DebtType)
  @IsOptional()
  type?: DebtType;
}
