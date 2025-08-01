import { BudgetCategory } from '@/budgeting/domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty({
    description: 'Name of the budget',
    example: 'Groceries',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Budget category',
    enum: BudgetCategory,
    example: BudgetCategory.FIXED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @ApiProperty({
    description: 'Color for budget visualization',
    example: '#FF5733',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    description: 'Icon for budget visualization',
    example: 'shopping-cart',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
