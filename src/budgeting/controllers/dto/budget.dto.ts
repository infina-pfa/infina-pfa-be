import { BudgetAggregate, BudgetCategory } from '@/budgeting/domain';
import { BaseDto } from '@/common/base';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction.dto';

export class BudgetResponseDto extends BaseDto {
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

  @ApiProperty({
    description: 'List of transactions for this budget',
    type: [TransactionResponseDto],
    required: false,
  })
  transactions?: TransactionResponseDto[];

  public static fromEntity(
    entity: BudgetAggregate,
    includeTransactions = false,
  ): BudgetResponseDto {
    const { budget } = entity;
    const dto: BudgetResponseDto = {
      ...budget.props,
      id: budget.id,
      amount: budget.amount.value,
      spent: entity.spent.value,
      userId: budget.userId,
    };

    if (includeTransactions) {
      dto.transactions = entity.spending.map((transaction) =>
        TransactionResponseDto.fromEntity(transaction),
      );
    }

    return dto;
  }
}
