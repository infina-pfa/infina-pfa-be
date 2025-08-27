import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DebtType } from '@/debt/domain';

export class UpdateDebtDto {
  @ApiProperty({
    description: 'Name of the lender',
    example: 'Bank of America',
    required: false,
  })
  @IsString()
  @IsOptional()
  lender?: string;

  @ApiProperty({
    description: 'Purpose of the debt',
    example: 'Home mortgage',
    required: false,
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({
    description: 'Interest rate (as percentage)',
    example: 5.5,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Interest rate must be non-negative' })
  rate?: number;

  @ApiProperty({
    description: 'Due date for the debt',
    example: '2025-12-31T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @ApiProperty({
    description: 'Debt type',
    enum: DebtType,
    example: DebtType.BAD_DEBT,
  })
  @IsEnum(DebtType)
  @IsOptional()
  type?: DebtType;
}
