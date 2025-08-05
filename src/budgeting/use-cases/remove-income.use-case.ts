import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { BudgetErrorFactory, TransactionRepository } from '../domain';

@Injectable()
export class RemoveIncomeUseCase extends BaseUseCase<
  { id: string; userId?: string },
  void
> {
  constructor(private readonly transactionRepository: TransactionRepository) {
    super();
  }

  async execute(input: { id: string; userId?: string }): Promise<void> {
    const income = await this.transactionRepository.findById(input.id);

    if (!income || (input.userId && income.props.userId !== input.userId)) {
      throw BudgetErrorFactory.incomeNotFound();
    }

    await this.transactionRepository.delete(income);
  }
}
