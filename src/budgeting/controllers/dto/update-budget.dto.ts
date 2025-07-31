import { BudgetCategory } from '@/budgeting/domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty({
    description: 'Name of the budget',
    example: 'Groceries',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Budget amount',
    example: 500,
    required: false,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Budget amount must be greater than 0' })
  amount?: number;

  @ApiProperty({
    description: 'Budget category',
    enum: BudgetCategory,
    example: BudgetCategory.FIXED,
    required: false,
  })
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @ApiProperty({
    description: 'Color for budget visualization',
    example: '#FF5733',
    required: false,
  })
  @IsString()
  color?: string;

  @ApiProperty({
    description: 'Icon for budget visualization',
    example: 'shopping-cart',
    required: false,
  })
  @IsString()
  icon?: string;
}
