import {
  BudgetEntity,
  BudgetRepository,
  BudgetTransactionAggregate,
  BudgetTransactionRepository,
  TransactionRepository,
} from '@/budgeting/domain';
import { BudgetORM } from '@/common/types/orms';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetTransactionRepositoryImpl extends BudgetTransactionRepository {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {
    super();
  }

  async findOne(
    userId: string,
    budgetId: string,
  ): Promise<BudgetTransactionAggregate | null> {
    const budget = await this.budgetRepository.findById(budgetId);

    if (!budget) {
      return null;
    }

    const transactions = await this.transactionRepository.findManyByMonth(
      {
        userId,
      },
      {
        month: budget.props.month,
        year: budget.props.year,
      },
    );

    return BudgetTransactionAggregate.create({
      budget,
      transactions,
    });
  }
}
