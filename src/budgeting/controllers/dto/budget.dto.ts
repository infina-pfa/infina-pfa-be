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
import { BudgetCategory } from '@/budgeting/domain/entities/budget.entity';

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
    example: 2023,
  })
  @IsNumber()
  @Min(2025)
  year: number;
}

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

export class BudgetResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the budget',
    example: 'Groceries',
  })
  name: string;

  @ApiProperty({
    description: 'Budget amount',
    example: 500,
  })
  amount: number;

  @ApiProperty({
    description: 'User ID who owns this budget',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Budget category',
    enum: BudgetCategory,
    example: BudgetCategory.FIXED,
  })
  category: BudgetCategory;

  @ApiProperty({
    description: 'Color for budget visualization',
    example: '#FF5733',
  })
  color: string;

  @ApiProperty({
    description: 'Icon for budget visualization',
    example: 'shopping-cart',
  })
  icon: string;

  @ApiProperty({
    description: 'Month (1-12)',
    example: 7,
  })
  month: number;

  @ApiProperty({
    description: 'Year',
    example: 2023,
  })
  year: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-07-21T15:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-07-21T15:30:00Z',
  })
  updatedAt: Date;
}

export class BudgetWithSpendingResponseDto extends BudgetResponseDto {
  @ApiProperty({
    description: 'Total amount spent from this budget',
    example: 275.5,
    type: 'number',
  })
  totalSpent: number;

  @ApiProperty({
    description: 'Number of transactions associated with this budget',
    example: 12,
    type: 'integer',
  })
  transactionCount: number;

  @ApiProperty({
    description: 'Remaining amount in the budget',
    example: 224.5,
    type: 'number',
  })
  remainingAmount: number;

  @ApiProperty({
    description: 'Percentage of budget spent (0-100)',
    example: 55.1,
    type: 'number',
  })
  spentPercentage: number;
}
