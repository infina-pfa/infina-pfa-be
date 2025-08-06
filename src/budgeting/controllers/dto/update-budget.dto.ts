import { BudgetCategory } from '@/budgeting/domain';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

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

  @ApiProperty({
    description: 'Budget amount',
    example: 500,
    minimum: 0.01,
  })
  @IsNumber()
  @IsOptional()
  @Min(0.01, { message: 'Budget amount must be greater than 0' })
  amount: number;
}

export class UpdateBudgetInternalDto extends UpdateBudgetDto {
  @ApiProperty({
    description: 'User ID who owns this budget',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}
