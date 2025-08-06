import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { BudgetTransaction, TransactionRepository } from '../domain';

@Injectable()
export class GetMonthlySpendingUseCase extends BaseUseCase<
  { userId: string; month: number; year: number },
  BudgetTransaction[]
> {
  constructor(private readonly transactionRepository: TransactionRepository) {
    super();
  }

  async execute(input: {
    userId: string;
    month: number;
    year: number;
  }): Promise<BudgetTransaction[]> {
    const transactions =
      await this.transactionRepository.findBudgetSpendingByMonth(
        input.userId,
        input.month,
        input.year,
      );

    return transactions;
  }
}
