import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BudgetResponseDto } from './budget.dto';
import { BudgetEntity } from '@/budgeting/domain';

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
    type: BudgetResponseDto,
  })
  budget: BudgetResponseDto;

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
    dto.budget = budget
      ? BudgetResponseDto.fromEntity(budget)
      : new BudgetResponseDto();
    return dto;
  }
}
