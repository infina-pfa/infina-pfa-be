import { BudgetCategory, BudgetEntity } from '@/budgeting/domain';
import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';
import { BaseDto } from '@/common/base';
import { ApiProperty } from '@nestjs/swagger';

export class BudgetDto extends BaseDto {
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

  @ApiProperty({
    description: 'Spent amount',
    example: 100,
  })
  spent: number;

  public static fromEntity(entity: BudgetEntity): BudgetDto {
    const dto = new BudgetDto();
    dto.id = entity.id;
    dto.name = entity.props.name;
    dto.amount = entity.amount.value;
    dto.userId = entity.userId;
    dto.category = entity.props.category;
    return dto;
  }
}

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction name',
    example: 'Grocery shopping',
  })
  name: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Weekly grocery shopping at Walmart',
  })
  description: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 50,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.BUDGET_SPENDING,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Recurring frequency in days (0 for one-time)',
    example: 0,
  })
  recurring: number;

  @ApiProperty({
    description: 'Transaction creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Transaction last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Budget',
    type: BudgetDto,
  })
  budget: BudgetDto;

  static fromEntity(
    transaction: TransactionEntity,
    budget?: BudgetEntity,
  ): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = transaction.id;
    dto.name = transaction.props.name;
    dto.description = transaction.props.description;
    dto.amount = transaction.amount.value;
    dto.type = transaction.props.type;
    dto.recurring = transaction.props.recurring;
    dto.createdAt = transaction.props.createdAt;
    dto.updatedAt = transaction.props.updatedAt;
    dto.budget = budget ? BudgetDto.fromEntity(budget) : new BudgetDto();
    return dto;
  }
}
