import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BudgetCategory } from '@/budgeting/domain';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Name of the budget',
    example: 'Groceries',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Budget amount',
    example: 500,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'Budget amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'User ID who owns this budget',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Budget category',
    enum: BudgetCategory,
    example: BudgetCategory.FIXED,
  })
  @IsEnum(BudgetCategory)
  category: BudgetCategory;

  @ApiProperty({
    description: 'Color for budget visualization',
    example: '#FF5733',
  })
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Icon for budget visualization',
    example: 'shopping-cart',
  })
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Month (1-12)',
    example: 7,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Year',
    example: 2025,
  })
  @IsNumber()
  @Min(2025)
  year: number;
}
